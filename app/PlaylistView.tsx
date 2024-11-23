"use client";

import { useState, useEffect } from "react";
import { PlaylistInterface, PlayerStateInterface } from "@/app/types";
import { prominent } from "color.js";
import PauseIcon from "@/public/pause.svg";
import PlayIcon from "@/public/play.svg";
import clsx from "clsx";
import { motion } from "framer-motion";

export default function PlaylistView({
  playlist,
  currentPlayerState,
  onPlayTrack,
  onShowCover,
}: {
  playlist: PlaylistInterface;
  currentPlayerState: PlayerStateInterface | null;
  onPlayTrack: ({
    contextUri,
    trackUri,
  }: {
    contextUri: string | null;
    trackUri: string;
  }) => void;
  onShowCover: (cover: { layoutId: string; coverUrl: string }) => void;
}) {
  const [dominantColor, setDominantColor] = useState<string>("");
  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null);

  const extractColors = async (imageUrl: string) => {
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
  };

  function getTitleFontSize(title: string) {
    if (title.length <= 6) return "44px";
    if (title.length <= 8) return "36px";
    return "24px";
  }

  function handleTrackMouseEnter(e: React.MouseEvent, trackId: string) {
    const target = e.target as HTMLElement;
    if (target.closest("[data-track-image]")) return;
    setHoveredTrackId(trackId);
  }

  useEffect(() => {
    if (playlist) {
      const playlistCoverArtUrl = playlist?.tracks[0]?.album?.images[0]?.url;
      if (playlistCoverArtUrl) {
        extractColors(playlistCoverArtUrl);
      }
    }
  }, [playlist]);

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
          <div
            key={`${track.spotify_id}-${index}`}
            className="group flex cursor-default items-center pl-16 pr-32 hover:bg-[rgba(255,255,255,0.04)]"
            onMouseEnter={(e: React.MouseEvent) =>
              handleTrackMouseEnter(e, track.spotify_id)
            }
            onMouseLeave={() => setHoveredTrackId(null)}
            onClick={() =>
              onPlayTrack({
                contextUri: playlist.spotify_uri,
                trackUri: track.spotify_uri,
              })
            }
          >
            <span
              className={clsx(
                "relative mr-24 flex h-32 w-32 flex-shrink-0 items-center justify-end text-[22px]",
                currentPlayerState?.currentTrackId === track.spotify_id
                  ? "text-background-brand"
                  : "text-gray-500",
              )}
            >
              <span
                className={clsx({
                  hidden:
                    hoveredTrackId === track.spotify_id ||
                    (currentPlayerState?.currentTrackId === track.spotify_id &&
                      !currentPlayerState?.isPaused),
                })}
              >
                {index + 1}
              </span>
              <PlayIcon
                className={clsx("hidden h-[26px] w-[26px]", {
                  "group-hover:block":
                    hoveredTrackId === track.spotify_id &&
                    !(
                      currentPlayerState?.currentTrackId === track.spotify_id &&
                      !currentPlayerState?.isPaused
                    ),
                  "translate-x-[6px]": (index + 1).toString().length === 1,
                })}
              />
              {currentPlayerState?.currentTrackId === track.spotify_id &&
                !currentPlayerState?.isPaused && (
                  <PauseIcon
                    className={clsx("h-[26px] w-[26px]", {
                      "translate-x-[6px]": (index + 1).toString().length === 1,
                    })}
                  />
                )}
            </span>
            <motion.div
              data-track-image
              key={`${track.spotify_id}-${index}-cover`}
              layoutId={track.spotify_id}
              transition={{
                type: "spring",
                duration: 0.3,
                bounce: 0,
              }}
              whileHover={{
                scale: 1.1,
                rotate: Math.random() < 0.5 ? 1 : -1,
                transition: { type: "spring", duration: 0.2, bounce: 0 },
              }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onShowCover({
                  layoutId: track.spotify_id,
                  coverUrl: track.album.images[0]?.url,
                });
              }}
              onMouseEnter={(e: React.MouseEvent) => {
                setHoveredTrackId(null);
                e.stopPropagation();
                const preloadImage = new Image();
                preloadImage.src = track.album.images[0]?.url;
              }}
              onMouseLeave={() => setHoveredTrackId(track.spotify_id)}
              className="mr-14 box-content h-52 w-52 flex-shrink-0 cursor-zoom-in select-none rounded-[1px] py-11"
            >
              <img
                draggable="false"
                src={track.album.images[1]?.url}
                alt={track.album.name}
                className="h-full w-full rounded-[1px]"
              />
            </motion.div>
            <div className="mr-40 min-w-0 flex-grow">
              <div
                className={clsx(
                  "mb-2 overflow-hidden text-ellipsis whitespace-nowrap text-baseCompact",
                  currentPlayerState?.currentTrackId === track.spotify_id
                    ? "text-background-brand"
                    : "text-white",
                )}
              >
                {track.name}
              </div>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-baseCompact text-gray-400">
                {track.artists.map((artist) => artist.name).join(", ")}
              </div>
            </div>
            <div className="text-[19px] text-gray-400">
              {Math.floor(track.duration_ms / 60000)}:
              {String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(
                2,
                "0",
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
