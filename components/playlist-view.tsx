"use client";

import * as React from "react";
import { PlaylistInterface } from "@/app/_types";
import { prominent } from "color.js";
import { motion } from "framer-motion";
import { useSpotifyPlayerContext } from "@/contexts/spotify-player-context";
import { PlaylistTrack } from "@/components/playlist-track";

const PlaylistView = function PlaylistView({
  playlist,
  onShowCover,
}: {
  playlist: PlaylistInterface;
  onShowCover: (cover: { layoutId: string; coverUrl: string }) => void;
}) {
  const [dominantColor, setDominantColor] = React.useState<string>("");
  const { handlePlaySpotifyTrack, currentPlayerState } =
    useSpotifyPlayerContext();

  const extractColors = React.useCallback(
    async (imageUrl: string) => {
      try {
        if (!playlist) {
          return;
        }

        const dominantColor = await prominent(imageUrl, {
          amount: 1,
          format: "hex",
        });
        setDominantColor(dominantColor as string);
      } catch (error) {
        console.error("Error extracting colors:", error);
      }
    },
    [playlist],
  );

  function getTitleFontSize(title: string) {
    if (title.length <= 6) return "44px";
    if (title.length <= 8) return "36px";
    return "24px";
  }

  React.useEffect(() => {
    if (playlist) {
      const playlistCoverArtUrl = playlist?.tracks[0]?.album?.images[0]?.url;
      if (playlistCoverArtUrl) {
        extractColors(playlistCoverArtUrl);
      }
    }
  }, [playlist, extractColors]);

  return (
    <div className="custom-scrollbar relative h-full min-w-0 flex-1 overflow-y-auto rounded border border-input bg-gray-800">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(to bottom, ${dominantColor}bf 0%, #1f1f1fbf 60%)`,
        }}
      />

      <div className="relative z-[1] flex gap-14 p-28">
        <motion.div
          key={playlist.id}
          layoutId={playlist.id}
          initial={false}
          transition={{
            type: "spring",
            duration: 0.4,
            bounce: 0,
          }}
          whileHover={{
            scale: 1.05,
            rotate: Math.random() < 0.5 ? 1 : -1,
            transition: { type: "spring", duration: 0.2, bounce: 0 },
          }}
          onClick={() =>
            onShowCover({
              layoutId: playlist.id,
              coverUrl: playlist.tracks[0].album.images[0]?.url,
            })
          }
          className="h-[96px] w-[96px] flex-shrink-0 cursor-zoom-in select-none bg-gray-700 shadow-sm"
        >
          <img
            src={playlist.tracks[0].album.images[0]?.url}
            alt={playlist.name}
            draggable="false"
            className="h-full w-full rounded-[1px]"
          />
        </motion.div>
        <div className="mr-20 min-w-0 flex-grow pt-12">
          <h1
            className="mb-8 overflow-hidden text-ellipsis whitespace-nowrap font-black leading-[1.2] text-white"
            style={{ fontSize: getTitleFontSize(playlist.name) }}
          >
            {playlist.name}
          </h1>
          <p className="pl-2 text-gray-200">{playlist.description}</p>
        </div>
      </div>

      {/* Tracks List */}
      <div
        className="relative z-[1] flex select-none flex-col bg-[rgba(0,0,0,0.12)] pb-88 pt-16"
        style={{ WebkitUserSelect: "none" }}
      >
        {playlist.tracks.map((track, index) => (
          <PlaylistTrack
            key={`${track.spotify_id}-${index}`}
            track={track}
            index={index}
            isCurrentTrack={
              currentPlayerState?.currentTrackId === track.spotify_id
            }
            isPlaying={!currentPlayerState?.isPaused}
            playlistSpotifyUri={playlist.spotify_uri}
            onShowCover={onShowCover}
            onPlayTrack={handlePlaySpotifyTrack}
          />
        ))}
      </div>
    </div>
  );
};

export default PlaylistView;
