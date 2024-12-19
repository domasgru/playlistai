"use client";

import * as React from "react";

import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Toaster, toast } from "sonner";
import { useSession } from "next-auth/react";

import { PlaylistInterface, CoverModalDataInterface } from "@/app/_types";
import { signInWithSpotify } from "@/app/actions-auth";
import { createPlaylist, updatePlaylistInSpotify } from "@/app/actions";
import { savePlaylistInIDB } from "@/app/db";
import {
  usePlaylistDataContext,
  usePlaylistApiContext,
} from "@/contexts/playlist-context";
import { isDemoMode } from "@/utils/isDemoMode";

import PlaylistView from "@/components/playlist-view";
import GenerateButton from "@/components/generate-button";
import PlaylistSelect from "@/components/playlist-select";
import PlaylistEmptyScreen from "@/components/playlist-empty-screen";
import PlaylistGenerateNewInput from "@/components/playlist-generate-new-input";
import PlaylistUpdateInput from "@/components/playlist-update-input";
import CoverModal from "@/components/cover-modal";

let didInit = false;

export default function PlaylistGenerator() {
  console.log("rendering -----> PlaylistGenerator");
  const { data: session } = useSession();
  const { selectedPlaylist } = usePlaylistDataContext();
  const { setSelectedPlaylistId, setPlaylists } = usePlaylistApiContext();
  const [showNewPlaylistInput, setShowNewPlaylistInput] = React.useState(false);

  const isEmptyStateShown =
    !selectedPlaylist || (!session?.user && !isDemoMode);

  const [coverModalData, setCoverModalData] =
    React.useState<CoverModalDataInterface | null>(null);

  const [isGeneratingNewPlaylist, setIsGeneratingNewPlaylist] =
    React.useState(false);
  async function generateNewPlaylist(playlistDescriptionInput: string) {
    if (isDemoMode) {
      toast("Sorry you can't generate playlists yet, this is a demo mode.", {
        description: "Waiting for the Spotify to approve this app.",
      });
      return;
    }

    try {
      if (!session?.user) {
        sessionStorage.setItem("generate", playlistDescriptionInput);
        signInWithSpotify();
        return;
      }

      setIsGeneratingNewPlaylist(true);

      const playlist = await createPlaylist({
        playlistDescription: playlistDescriptionInput,
      });
      setSelectedPlaylistId(playlist.id);
      setShowNewPlaylistInput(false);
      setIsGeneratingNewPlaylist(false);
      savePlaylistInIDB(playlist);
      setPlaylists((prevPlaylists) => [playlist, ...prevPlaylists]);

      const updatedPlaylist = await updatePlaylistInSpotify(playlist);
      setSelectedPlaylistId(updatedPlaylist.id);
      savePlaylistInIDB(updatedPlaylist);
      setPlaylists((prevPlaylists) =>
        prevPlaylists.map((p) =>
          p.id === updatedPlaylist.id ? updatedPlaylist : p,
        ),
      );
    } catch (error) {
      console.error("Failed to generate playlist:", error);
    } finally {
      setShowNewPlaylistInput(false);
      setIsGeneratingNewPlaylist(false);
    }
  }

  const [isRegenerating, setIsRegenerating] = React.useState(false);
  async function regenerateSelectedPlaylist(
    playlistDescriptionInput: string,
  ): Promise<void> {
    if (!selectedPlaylist) return;

    try {
      setIsRegenerating(true);
      const regeneratedPlaylist = await createPlaylist({
        playlistDescription: playlistDescriptionInput,
      });

      const updatedPlaylist: PlaylistInterface = {
        ...selectedPlaylist,
        tracks: regeneratedPlaylist.tracks,
        description: regeneratedPlaylist.description,
        name: regeneratedPlaylist.name,
        generated_tracks: regeneratedPlaylist.generated_tracks,
        updated_at: regeneratedPlaylist.updated_at,
      };

      setSelectedPlaylistId(updatedPlaylist.id);
      setPlaylists((prevPlaylists) =>
        prevPlaylists.map((playlist) =>
          playlist.id === updatedPlaylist.id ? updatedPlaylist : playlist,
        ),
      );
      setIsRegenerating(false);
      savePlaylistInIDB(updatedPlaylist);

      const updatedPlaylistInSpotify =
        await updatePlaylistInSpotify(updatedPlaylist);
      setSelectedPlaylistId(updatedPlaylistInSpotify.id);
      savePlaylistInIDB(updatedPlaylistInSpotify);
    } catch (error) {
      console.error("Failed to regenerate playlist:", error);
    } finally {
      setIsRegenerating(false);
    }
  }

  function handleNewPlaylistInputMouseleave() {
    if (!isGeneratingNewPlaylist) {
      setShowNewPlaylistInput(false);
    }
  }

  function getBlurOutStyles(transformOrigin: string) {
    return blurOutPlaylistView
      ? {
          transform: `scale(0.9)`,
          transformOrigin: transformOrigin,
          filter: `blur(2px) brightness(0.5)`,
          transition: "all 0.2s ease-in-out",
        }
      : {
          transform: `scale(1)`,
          transformOrigin: transformOrigin,
          filter: `blur(0px) brightness(1)`,
          transition: "all 0.2s ease-in-out",
        };
  }

  React.useEffect(() => {
    if (isDemoMode) return;

    if (!didInit) {
      const generateParam = sessionStorage.getItem("generate");
      if (generateParam) {
        generateNewPlaylist(generateParam);
        sessionStorage.removeItem("generate");
      }
      didInit = true;
    }
  }, []);

  const blurOutPlaylistView =
    (showNewPlaylistInput && !isGeneratingNewPlaylist) || coverModalData;

  return (
    <div className="h-[100vh] w-full">
      {isEmptyStateShown && (
        <PlaylistEmptyScreen
          onSubmit={generateNewPlaylist}
          isLoggedIn={!!session?.user}
          isLoading={isGeneratingNewPlaylist}
        />
      )}

      {!isEmptyStateShown && (
        <div className="relative mx-auto h-full max-w-[592px] py-24">
          <div className="relative flex h-full w-full flex-col gap-16">
            {/* Playlists manager */}
            <div className="z-10 flex justify-center">
              <div
                className="flex w-full flex-shrink-0 items-center justify-between gap-16"
                style={getBlurOutStyles("center calc(100% + 150px)")}
              >
                <PlaylistSelect />

                <GenerateButton
                  size="lg"
                  onClick={() => setShowNewPlaylistInput(!showNewPlaylistInput)}
                >
                  <span className="hidden sm:inline">New playlist</span>
                  <Image
                    src="/plus.svg"
                    alt="New playlist"
                    width={17}
                    height={17}
                    className="box-content h-[17px] w-[17px] p-[5px] sm:hidden"
                  />
                </GenerateButton>
              </div>
              <AnimatePresence>
                {(showNewPlaylistInput || isGeneratingNewPlaylist) && (
                  <PlaylistGenerateNewInput
                    isLoading={isGeneratingNewPlaylist}
                    onSubmit={generateNewPlaylist}
                    onMouseLeave={handleNewPlaylistInputMouseleave}
                    onEscape={handleNewPlaylistInputMouseleave}
                    onClickOutside={handleNewPlaylistInputMouseleave}
                  />
                )}
              </AnimatePresence>
            </div>
            {/* Playlist view */}
            <div
              className="relative h-full min-h-0 flex-1"
              style={getBlurOutStyles("center calc(0% + 150px)")}
            >
              <PlaylistView
                playlist={selectedPlaylist}
                onShowCover={setCoverModalData}
              />
              <PlaylistUpdateInput
                onSubmit={regenerateSelectedPlaylist}
                isLoading={isRegenerating}
                isDemoMode={isDemoMode}
              />
            </div>
          </div>
        </div>
      )}

      {!isEmptyStateShown && (
        <Image
          src="/logo.png"
          alt="Playlistai"
          width={110}
          height={26.6}
          className="absolute bottom-16 right-24 z-[-1] opacity-[0.6]"
        />
      )}

      <Toaster position="bottom-right" />

      <CoverModal
        isOpen={!!coverModalData}
        onClose={() => setCoverModalData(null)}
        layoutId={coverModalData?.layoutId}
        coverUrl={coverModalData?.coverUrl}
      />
    </div>
  );
}
