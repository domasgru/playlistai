"use client";

import { useState, useEffect } from "react";
import { PlaylistInterface } from "@/app/types";
import { prominent } from "color.js";
import { playTrack } from "@/app/actions-spotify";

export default function PlaylistView({
  playlist,
}: {
  playlist: PlaylistInterface;
  onSelectPlaylist: (playlist: PlaylistInterface) => void;
}) {
  const [dominantColor, setDominantColor] = useState<string>("");
  const [titleFontSize, setTitleFontSize] = useState<string>("44px");

  const extractColors = async (imageUrl: string) => {
    try {
      if (!playlist) {
        return;
      }

      const dominantColor = await prominent(
        playlist.tracks[0].album.images[0].url,
        {
          amount: 1,
          format: "hex",
        },
      );
      setDominantColor(dominantColor as string);
    } catch (error) {
      console.error("Error extracting colors:", error);
    }
  };

  const calculateTitleFontSize = (title: string) => {
    if (title.length <= 6) return "44px";
    if (title.length <= 8) return "36px";
    return "24px";
  };

  useEffect(() => {
    if (playlist) {
      if (playlist?.tracks[0]?.album.images[0]) {
        extractColors(playlist.tracks[0].album.images[0].url);
      }
      setTitleFontSize(calculateTitleFontSize(playlist.name));
    }
  }, [playlist]);

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden overflow-y-auto rounded-xl border border-input bg-gray-800">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(to bottom, ${dominantColor}bf 0%, #1f1f1fbf 60%)`,
        }}
      />

      <div className="relative z-[1] flex gap-20 p-28">
        <div className="h-[98px] w-[98px] flex-shrink-0 overflow-hidden rounded-[1px] bg-gray-700 shadow-sm">
          {playlist.tracks[0]?.album.images[0] && (
            <img
              src={playlist.tracks[0].album.images[0].url}
              alt={playlist.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="mr-20 min-w-0 flex-grow pt-12">
          <h1
            className="mb-8 overflow-hidden text-ellipsis whitespace-nowrap font-black leading-[1.2] text-white"
            style={{ fontSize: titleFontSize }}
          >
            {playlist.name}
          </h1>
          <p className="pl-2 text-gray-200">{playlist.description}</p>
        </div>
      </div>

      {/* Tracks List */}
      <div className="relative z-[1] flex flex-col space-y-2 bg-[rgba(0,0,0,0.12)] py-16">
        {playlist.tracks.map((track, index) => (
          <div
            key={track.id}
            className="flex cursor-default items-center py-10 pl-16 pr-32 hover:bg-[rgba(255,255,255,0.04)]"
            onClick={async () => {
              try {
                await playTrack(track.uri);
              } catch (error) {
                console.error("Error playing track:", error);
                // You might want to show a toast notification here
              }
            }}
          >
            <span className="mr-24 w-32 flex-shrink-0 text-right text-[22px] font-light text-gray-500">
              {index + 1}
            </span>
            <img
              src={track.album.images[1].url}
              alt={track.album.name}
              className="mr-12 h-56 w-56 flex-shrink-0 rounded-[1px]"
            />
            <div className="mr-40 min-w-0 flex-grow">
              <div className="mb-2 overflow-hidden text-ellipsis whitespace-nowrap text-baseCompact text-white">
                {track.name}
              </div>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-baseCompact text-gray-400">
                {track.artists.map((artist) => artist.name).join(", ")}
              </div>
            </div>
            <div className="text-[19px] font-light text-gray-400">
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
