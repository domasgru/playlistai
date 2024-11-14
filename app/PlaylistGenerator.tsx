"use client";

import PlaylistInput from "@/app/PlaylistInput";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { signInWithSpotify } from "@/app/actions-auth";
import { generatePlaylist } from "@/app/actions";
import { savePlaylist, updatePlaylist } from "@/app/db";
import { useState, useEffect, useRef } from "react";
import { PlaylistInterface } from "@/app/types";
import { getAllPlaylists } from "@/app/db";
import PlaylistView from "@/app/PlaylistView";
import GenerateButton from "@/app/GenerateButton";
import PlaylistSelect from "@/app/PlaylistSelect";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

export default function PlaylistGenerator() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);
  const [allPlaylists, setAllPlaylists] = useState<PlaylistInterface[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<PlaylistInterface | null>(null);
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);

  const isInitializing = status === "loading" || isLoadingPlaylists;

  const [isGeneratingNewPlaylist, setIsGeneratingNewPlaylist] = useState(
    searchParams.get("generate") !== null,
  );
  async function generateNewPlaylist(playlistDescriptionInput: string) {
    try {
      setIsGeneratingNewPlaylist(true);

      if (!session?.user) {
        signInWithSpotify(`/?generate=${playlistDescriptionInput}`);
        return;
      }

      const playlist = await generatePlaylist({
        playlistDescription: playlistDescriptionInput,
      });

      await savePlaylist(playlist);

      setSelectedPlaylist(playlist);
      setAllPlaylists((prevPlaylists) => [playlist, ...prevPlaylists]);
    } catch (error) {
      console.error("Failed to generate playlist:", error);
    } finally {
      setShowNewPlaylistInput(false);
      setIsGeneratingNewPlaylist(false);
    }
  }

  function handleNewPlaylistInputMouseleave() {
    if (!isGeneratingNewPlaylist) {
      setShowNewPlaylistInput(false);
    }
  }

  const [isRegenerating, setIsRegenerating] = useState(false);
  async function regenerateSelectedPlaylist(
    playlistDescriptionInput: string,
  ): Promise<void> {
    if (!selectedPlaylist) return;

    try {
      setIsRegenerating(true);
      const regeneratedPlaylist = await generatePlaylist({
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

      setAllPlaylists((prevPlaylists) =>
        prevPlaylists.map((playlist) =>
          playlist.id === updatedPlaylist.id ? updatedPlaylist : playlist,
        ),
      );

      const result = await updatePlaylist(updatedPlaylist);
      if (result === null) {
        throw new Error("Failed to update playlist in database");
      }

      setSelectedPlaylist(updatedPlaylist);
    } catch (error) {
      console.error("Failed to regenerate playlist:", error);
    } finally {
      setIsRegenerating(false);
    }
  }

  useEffect(() => {
    const loadPlaylists = async () => {
      const loadedPlaylists = await getAllPlaylists();
      if (!loadedPlaylists) return;

      const sortedPlaylists = loadedPlaylists.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setAllPlaylists(sortedPlaylists);
      if (sortedPlaylists.length > 0) {
        setSelectedPlaylist(sortedPlaylists[0]);
      }

      setIsLoadingPlaylists(false);
    };
    loadPlaylists();
  }, []);

  const blurOutPlaylistView = showNewPlaylistInput && !isGeneratingNewPlaylist;

  const newPlaylistInputRef = useRef(null);

  return (
    <div>
      {isInitializing && (
        <div className="flex min-h-screen flex-col items-center p-8 pt-[24vh] text-white">
          <h1 className="mb-[72px] text-heading font-black">
            Loading your playlists...
          </h1>
        </div>
      )}

      {!isInitializing && (
        <>
          {(!session?.user || !selectedPlaylist) && (
            <div className="flex min-h-screen flex-col items-center p-8 pt-[24vh] text-white">
              <h1 className="mb-[72px] text-heading font-black">
                Generate your first playlist
              </h1>
              <PlaylistInput
                showSuggestions={true}
                onSubmit={generateNewPlaylist}
                isLoading={isGeneratingNewPlaylist}
              />
            </div>
          )}

          {session?.user && selectedPlaylist && (
            <div className="relative mx-auto h-[100vh] max-w-[592px] py-24">
              <div className="relative flex h-full w-full flex-col gap-16">
                <div className="z-10 flex justify-center">
                  <div
                    className="flex w-full flex-shrink-0 items-center justify-between gap-16"
                    style={{
                      transform: `scale(${blurOutPlaylistView ? 0.9 : 1})`,
                      transformOrigin: `center calc(100% + 150px)`,
                      filter: `blur(${blurOutPlaylistView ? "2px" : "0px"}) brightness(${blurOutPlaylistView ? 0.5 : 1})`,
                      transition: "all 0.15s ease-in-out",
                    }}
                  >
                    <PlaylistSelect
                      playlists={allPlaylists}
                      selectedPlaylist={selectedPlaylist}
                      onSelectPlaylist={setSelectedPlaylist}
                    />

                    <GenerateButton
                      text="New playlist"
                      size="lg"
                      onClick={() =>
                        setShowNewPlaylistInput(!showNewPlaylistInput)
                      }
                    />
                  </div>
                  <AnimatePresence>
                    {(showNewPlaylistInput || isGeneratingNewPlaylist) && (
                      <motion.div
                        initial={{ y: -500, scale: 0.5 }}
                        animate={{ y: 0, scale: 1 }}
                        exit={{
                          y: -500,
                          scale: 0.8,
                          transition: { duration: 0.6 },
                        }}
                        transition={{
                          duration: 0.25,
                          type: "spring",
                          bounce: 0,
                        }}
                        className={clsx(
                          "absolute top-0 z-10 box-content w-full",
                          showNewPlaylistInput &&
                            !isGeneratingNewPlaylist &&
                            "px-[100px] pb-[80px]",
                        )}
                        onMouseLeave={handleNewPlaylistInputMouseleave}
                      >
                        <PlaylistInput
                          onSubmit={generateNewPlaylist}
                          isLoading={isGeneratingNewPlaylist}
                          onEscape={handleNewPlaylistInputMouseleave}
                          onClickOutside={handleNewPlaylistInputMouseleave}
                          variant="dark"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div
                  className="relative h-full min-h-0 flex-1"
                  style={{
                    transform: `scale(${blurOutPlaylistView ? 0.9 : 1})`,
                    transformOrigin: `center calc(0% + 150px)`,
                    filter: `blur(${blurOutPlaylistView ? "2px" : "0px"}) brightness(${blurOutPlaylistView ? 0.5 : 1})`,
                    transition: "all 0.15s ease-in-out",
                  }}
                >
                  <PlaylistView
                    playlist={selectedPlaylist}
                    onSelectPlaylist={setSelectedPlaylist}
                  />

                  <PlaylistInput
                    className="absolute bottom-1 left-1 right-1 z-10 px-12 py-12 pt-36"
                    onSubmit={regenerateSelectedPlaylist}
                    submitText="Update"
                    placeholderText="Describe what you want to update..."
                    isLoading={isRegenerating}
                    collapsable={true}
                    variant="gray"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
