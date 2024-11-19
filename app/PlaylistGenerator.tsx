"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useLocalStorage } from "usehooks-ts";

import { signInWithSpotify } from "@/app/actions-auth";
import { generatePlaylist } from "@/app/actions";
import { savePlaylist, updatePlaylist } from "@/app/db";
import { PlaylistInterface } from "@/app/types";
import { getAllPlaylists } from "@/app/db";
import PlaylistView from "@/app/PlaylistView";
import GenerateButton from "@/app/GenerateButton";
import PlaylistSelect from "@/app/PlaylistSelect";
import PlaylistEmptyScreen from "@/app/PlaylistEmptyScreen";
import PlaylistGenerateNewInput from "@/app/PlaylistGenerateNewInput";
import FullscreenLoader from "@/app/FullscreenLoader";
import PlaylistUpdateInput from "@/app/PlaylistUpdateInput";
import { playTrack } from "./actions-spotify";
import { PlayerStateInterface, CoverModalDataInterface } from "./types";
import CoverModal from "@/app/CoverModal";

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

export default function PlaylistGenerator() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);
  const [allPlaylists, setAllPlaylists] = useState<PlaylistInterface[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] =
    useLocalStorage<PlaylistInterface | null>("selectedPlaylist", null);
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);

  const [player, setPlayer] = useState<any>(null);
  const [playerDeviceId, setPlayerDeviceId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayerState, setCurrentPlayerState] =
    useState<PlayerStateInterface | null>(null);
  const [coverModalData, setCoverModalData] =
    useState<CoverModalDataInterface | null>(null);

  const hasInitialized = status !== "loading" && !isLoadingPlaylists;

  async function loadPlaylists() {
    try {
      const loadedPlaylists = await getAllPlaylists();
      if (!loadedPlaylists) return;

      const sortedPlaylists = loadedPlaylists.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setAllPlaylists(sortedPlaylists);
      if (sortedPlaylists.length > 0 && !selectedPlaylist) {
        setSelectedPlaylist(sortedPlaylists[0]);
      }
    } catch (error) {
      console.error("Error while loading playlists:", error);
    } finally {
      setIsLoadingPlaylists(false);
    }
  }

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

  const [isRegenerating, setIsRegenerating] = useState(false);
  async function regenerateSelectedPlaylist(
    playlistDescriptionInput: string,
  ): Promise<void> {
    if (!selectedPlaylist) return;

    try {
      setIsRegenerating(true);
      const regeneratedPlaylist = await generatePlaylist({
        playlistDescription: playlistDescriptionInput,
        uploadToSpotify: false,
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

  function loadSpotifyPlayer() {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Playlsit App Web Player",
        getOAuthToken: (cb: any) => {
          cb(session?.access_token);
        },
        volume: 0.5,
      });
      setPlayer(player);

      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        setPlayerDeviceId(device_id);
      });

      player.addListener(
        "not_ready",
        ({ device_id }: { device_id: string }) => {
          console.error("Device ID has gone offline", device_id);
        },
      );

      player.addListener(
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

      player.connect();
    };
  }

  async function handlePlayTrack({
    contextUri,
    trackUri,
  }: {
    contextUri?: string;
    trackUri: string;
  }) {
    try {
      if (trackUri === currentPlayerState?.currentTrackUri) {
        player?.togglePlay();
      } else {
        await playTrack({ deviceId: playerDeviceId, trackUri, contextUri });
        player.activateElement();
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

  function handleShowCover(coverData: CoverModalDataInterface) {
    setCoverModalData(coverData);
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

  useEffect(() => {
    loadPlaylists();
  }, []);

  useEffect(() => {
    if (!hasInitialized) return;

    const generateParam = searchParams.get("generate");
    if (generateParam) {
      generateNewPlaylist(generateParam);
      router.replace("/");
    }

    loadSpotifyPlayer();
  }, [hasInitialized]);

  const blurOutPlaylistView =
    (showNewPlaylistInput && !isGeneratingNewPlaylist) || coverModalData;

  return (
    <div className="h-[100vh]">
      {!hasInitialized && <FullscreenLoader />}

      {hasInitialized && (
        <>
          {(!session?.user || !selectedPlaylist) && (
            <PlaylistEmptyScreen
              onSubmit={generateNewPlaylist}
              isLoggedIn={!!session?.user}
              isLoading={isGeneratingNewPlaylist}
            />
          )}

          {session?.user && selectedPlaylist && (
            <div className="relative mx-auto h-full max-w-[592px] py-24">
              <div className="relative flex h-full w-full flex-col gap-16">
                {/* Playlists manager */}
                <div className="z-10 flex justify-center">
                  <div
                    className="flex w-full flex-shrink-0 items-center justify-between gap-16"
                    style={getBlurOutStyles("center calc(100% + 150px)")}
                  >
                    <PlaylistSelect
                      playlists={allPlaylists}
                      selectedPlaylist={selectedPlaylist}
                      onSelectPlaylist={setSelectedPlaylist}
                    />

                    <GenerateButton
                      size="lg"
                      onClick={() =>
                        setShowNewPlaylistInput(!showNewPlaylistInput)
                      }
                    >
                      <span className="hidden sm:inline">New playlist</span>
                      <img
                        src="/plus.svg"
                        alt="New playlist"
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
                    onPlayTrack={handlePlayTrack}
                    onShowCover={handleShowCover}
                  />
                  <PlaylistUpdateInput
                    onSubmit={regenerateSelectedPlaylist}
                    isLoading={isRegenerating}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <CoverModal
        isOpen={!!coverModalData}
        onClose={() => setCoverModalData(null)}
        layoutId={coverModalData?.layoutId}
        coverUrl={coverModalData?.coverUrl}
      />
    </div>
  );
}
