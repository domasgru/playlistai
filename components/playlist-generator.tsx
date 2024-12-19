"use client";

import * as React from "react";

import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Toaster, toast } from "sonner";

import {
  PlaylistInterface,
  PlayerStateInterface,
  CoverModalDataInterface,
} from "@/app/_types";
import { signInWithSpotify } from "@/app/actions-auth";
import { createPlaylist, updatePlaylistInSpotify } from "@/app/actions";
import { playSpotifyTrack } from "@/app/actions-spotify";
import { savePlaylistInIDB } from "@/app/db";

import PlaylistView from "@/components/playlist-view";
import GenerateButton from "@/components/generate-button";
import PlaylistSelect from "@/components/playlist-select";
import PlaylistEmptyScreen from "@/components/playlist-empty-screen";
import PlaylistGenerateNewInput from "@/components/playlist-generate-new-input";
import PlaylistUpdateInput from "@/components/playlist-update-input";
import CoverModal from "@/components/cover-modal";

import { useSession } from "next-auth/react";
import {
  usePlaylistDataContext,
  usePlaylistApiContext,
} from "@/contexts/playlist-context";
import { isDemoMode } from "@/utils/isDemoMode";

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

export default function PlaylistGenerator() {
  const { data: session } = useSession();
  const { playlists, selectedPlaylist } = usePlaylistDataContext();
  const { setSelectedPlaylistId, setPlaylists } = usePlaylistApiContext();
  const [showNewPlaylistInput, setShowNewPlaylistInput] = React.useState(false);

  const isEmptyStateShown =
    !selectedPlaylist || (!session?.user && !isDemoMode);

  const playerRef = React.useRef<any>(null);
  const [playerDeviceId, setPlayerDeviceId] = React.useState<string | null>(
    null,
  );
  const [currentPlayerState, setCurrentPlayerState] =
    React.useState<PlayerStateInterface | null>(null);
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
      setAllPlaylists((prevPlaylists) =>
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

  function loadSpotifyPlayer() {
    playerRef.current = "loading";
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Playlistai.com Player",
        getOAuthToken: (cb: (token: string | undefined) => void) => {
          cb(session?.access_token);
        },
        volume: 0.5,
      });
      playerRef.current = player;

      playerRef.current.addListener(
        "ready",
        ({ device_id }: { device_id: string }) => {
          setPlayerDeviceId(device_id);
        },
      );

      playerRef.current.addListener(
        "not_ready",
        ({ device_id }: { device_id: string }) => {
          console.error("Device ID has gone offline", device_id);
        },
      );

      playerRef.current.addListener(
        "player_state_changed",
        (newState: {
          paused: boolean;
          position: number;
          duration: number;
          track_window: { current_track: any };
        }) => {
          if (newState) {
            setCurrentPlayerState({
              isPaused: newState.paused,
              currentTrackId: newState.track_window.current_track.id,
              currentTrackUri: newState.track_window.current_track.uri,
              position: newState.position,
              duration: newState.duration,
            });
          } else {
            setCurrentPlayerState(null);
          }
        },
      );

      playerRef.current.connect();
    };
  }

  function unloadSpotifyPlayer() {
    if (playerRef.current) {
      playerRef.current.disconnect();
      playerRef.current = null;
      setPlayerDeviceId(null);
      setCurrentPlayerState(null);
    }

    const spotifyScript = document.querySelector(
      'script[src="https://sdk.scdn.co/spotify-player.js"]',
    );
    if (spotifyScript) {
      spotifyScript.remove();
    }

    // Clean up the global callback
    window.onSpotifyWebPlaybackSDKReady = () => {};
  }

  function handlePlaySpotifyTrack({
    contextUri,
    trackUri,
  }: {
    contextUri: string | null;
    trackUri: string;
  }) {
    if (isDemoMode) {
      toast("Sorry you can't play tracks yet, this is a demo mode.", {
        description: "Waiting for the Spotify to approve this app",
      });
      return;
    }

    try {
      if (trackUri === currentPlayerState?.currentTrackUri) {
        playerRef.current?.togglePlay();
      } else {
        playSpotifyTrack({
          deviceId: playerDeviceId,
          trackUri,
          contextUri,
        });
        playerRef.current?.activateElement();
      }
    } catch (error) {
      console.error("Error playing track:", error);
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

    const generateParam = sessionStorage.getItem("generate");
    if (generateParam) {
      generateNewPlaylist(generateParam);
      sessionStorage.removeItem("generate");
    }
  }, []);

  React.useEffect(() => {
    if (isDemoMode) return;

    if (session?.user && selectedPlaylist && !playerRef.current) {
      loadSpotifyPlayer();
      return;
    }

    if ((!session?.user || !selectedPlaylist) && playerRef.current) {
      unloadSpotifyPlayer();
    }
  }, [session?.user, selectedPlaylist]);

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
                <PlaylistSelect
                  playlists={playlists}
                  selectedPlaylist={selectedPlaylist}
                  onSelectPlaylist={setSelectedPlaylistId}
                />

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
                currentPlayerState={currentPlayerState}
                onPlayTrack={handlePlaySpotifyTrack}
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
