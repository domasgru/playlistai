"use client";

import * as React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import PauseIcon from "@/public/pause.svg";
import PlayIcon from "@/public/play.svg";
import { TrackInterface } from "@/app/_types";

interface PlaylistTrackProps {
  track: TrackInterface;
  index: number;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  playlistSpotifyUri: string | null;
  onShowCover: (cover: { layoutId: string; coverUrl: string }) => void;
  onPlayTrack: (params: {
    contextUri: string | null;
    trackUri: string;
  }) => void;
}

export function PlaylistTrack({
  track,
  index,
  isCurrentTrack,
  isPlaying,
  playlistSpotifyUri,
  onShowCover,
  onPlayTrack,
}: PlaylistTrackProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      key={`${track.spotify_id}-${index}-track`}
      className="group flex cursor-default items-center pl-16 pr-32 hover:bg-[rgba(255,255,255,0.04)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() =>
        onPlayTrack({
          contextUri: playlistSpotifyUri,
          trackUri: track.spotify_uri,
        })
      }
    >
      <span
        className={clsx(
          "relative mr-24 flex h-32 w-32 flex-shrink-0 items-center justify-end text-[22px]",
          isCurrentTrack ? "text-background-brand" : "text-gray-500",
        )}
      >
        <span
          className={clsx({
            hidden: isHovered || (isCurrentTrack && isPlaying),
          })}
        >
          {index + 1}
        </span>
        <PlayIcon
          className={clsx("hidden h-[26px] w-[26px]", {
            "group-hover:block": isHovered && !(isCurrentTrack && isPlaying),
            "translate-x-[6px]": (index + 1).toString().length === 1,
          })}
        />
        {isCurrentTrack && isPlaying && (
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
          setIsHovered(false);
          e.stopPropagation();
          const preloadImage = new Image();
          preloadImage.src = track.album.images[0]?.url;
        }}
        onMouseLeave={() => setIsHovered(true)}
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
            isCurrentTrack ? "text-background-brand" : "text-white",
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
  );
}
