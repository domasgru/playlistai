"use client";

import { PlayerStateInterface } from "@/app/_types";
import { playSpotifyTrack } from "@/app/actions-spotify";
import { useSession } from "next-auth/react";
import * as React from "react";
import { toast } from "sonner";
import { isDemoMode } from "@/utils/isDemoMode";

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

interface SpotifyPlayerContextType {
  currentPlayerState: PlayerStateInterface | null;
  handlePlaySpotifyTrack: (params: {
    contextUri: string | null;
    trackUri: string;
  }) => void;
}

const SpotifyPlayerContext = React.createContext<
  SpotifyPlayerContextType | undefined
>(undefined);

export function SpotifyPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const playerRef = React.useRef<any>(null);
  const playerDeviceId = React.useRef<string | null>(null);
  const [currentPlayerState, setCurrentPlayerState] =
    React.useState<PlayerStateInterface | null>(null);

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
          playerDeviceId.current = device_id;
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
      playerDeviceId.current = null;
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
          deviceId: playerDeviceId.current,
          trackUri,
          contextUri,
        });
        playerRef.current?.activateElement();
      }
    } catch (error) {
      console.error("Error playing track:", error);
    }
  }

  React.useEffect(() => {
    if (isDemoMode) return;

    if (session?.user && !playerRef.current) {
      loadSpotifyPlayer();
      return;
    }

    if (!session?.user && playerRef.current) {
      unloadSpotifyPlayer();
    }

    return () => {
      unloadSpotifyPlayer();
    };
  }, [session?.user]);

  return (
    <SpotifyPlayerContext.Provider
      value={{
        currentPlayerState,
        handlePlaySpotifyTrack,
      }}
    >
      {children}
    </SpotifyPlayerContext.Provider>
  );
}

export function useSpotifyPlayerContext() {
  const context = React.useContext(SpotifyPlayerContext);
  if (!context) {
    throw new Error(
      "useSpotifyPlayerContext must be used within a SpotifyPlayerProvider",
    );
  }
  return context;
}
