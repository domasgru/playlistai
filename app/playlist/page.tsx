"use client";

import { useState, useEffect } from "react";
import { PlaylistInterface } from "../types";
import { getAllPlaylists } from "../indexedDB";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import ChevronDown from "@/public/chevron-down.svg";
import { prominent } from "color.js";
import { playTrack } from "../actions-spotify";

export default function PlaylistView() {
  const [playlists, setPlaylists] = useState<PlaylistInterface[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<PlaylistInterface | null>(null);
  const [dominantColor, setDominantColor] = useState<string>("");
  const [titleFontSize, setTitleFontSize] = useState<string>("44px");

  const extractColors = async (imageUrl: string) => {
    try {
      if (!selectedPlaylist) {
        return;
      }

      const dominantColor = await prominent(
        selectedPlaylist.tracks[0].album.images[0].url,
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

  useEffect(() => {
    const loadPlaylists = async () => {
      const loadedPlaylists = await getAllPlaylists();
      const sortedPlaylists = loadedPlaylists.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setPlaylists(sortedPlaylists);
      if (sortedPlaylists.length > 0) {
        setSelectedPlaylist(sortedPlaylists[0]);
      }
    };
    loadPlaylists();
  }, []);

  useEffect(() => {
    if (selectedPlaylist) {
      if (selectedPlaylist?.tracks[0]?.album.images[0]) {
        extractColors(selectedPlaylist.tracks[0].album.images[0].url);
      }
      setTitleFontSize(calculateTitleFontSize(selectedPlaylist.name));
    }
  }, [selectedPlaylist]);

  const calculateTitleFontSize = (title: string) => {
    if (title.length <= 6) return "44px";
    if (title.length <= 8) return "36px";
    return "24px";
  };

  return (
    <div className="mx-auto flex max-h-[100vh] max-w-[592px] flex-col gap-16 py-24">
      {/* Dropdown and Generate Button */}
      <div className="flex flex-shrink-0 items-center justify-between gap-16">
        <Listbox
          value={selectedPlaylist}
          onChange={setSelectedPlaylist}
          as="div"
          className="relative flex-1"
        >
          <ListboxButton
            className={({ open }) =>
              `border-input hover:bg-gray-750 flex w-full cursor-default items-center rounded border py-10 pl-16 pr-20 text-white shadow-innerGlow ${open ? "bg-gray-750" : "bg-gray-800"} `
            }
          >
            {selectedPlaylist && (
              <img
                src={selectedPlaylist.tracks[0]?.album.images[0].url}
                alt="Album cover"
                className="mr-16 h-52 w-52 rounded-full"
              />
            )}
            <span className="flex-1 truncate text-left">
              {selectedPlaylist?.name || "Select playlist"}
            </span>
            <ChevronDown className="h-28 w-28" />
          </ListboxButton>

          <ListboxOptions className="border-input absolute z-10 mt-4 w-full overflow-hidden rounded border bg-gray-800 py-4 shadow-innerGlow">
            {playlists.map((playlist) => (
              <ListboxOption
                key={playlist.id}
                value={playlist}
                className={({ active }) =>
                  `flex w-full items-center gap-12 px-16 py-8 text-left hover:cursor-default hover:bg-gray-700`
                }
              >
                <img
                  src={
                    playlist.tracks[0]?.album.images[
                      playlist.tracks[0]?.album.images.length - 1
                    ].url
                  }
                  alt=""
                  className="h-32 w-32 rounded"
                />
                <span className="truncate">{playlist.name}</span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Listbox>

        <button className="hover:bg-background-brandHover flex-shrink-0 cursor-default rounded-full bg-background-brand px-36 py-20 font-medium text-foreground-dark">
          Generate new
        </button>
      </div>

      {/* Playlist Card */}
      {selectedPlaylist && (
        <div className="border-input relative min-w-0 flex-1 overflow-hidden overflow-y-auto rounded-xl border bg-gray-800">
          <div
            className="absolute inset-0 z-0"
            style={{
              background: `linear-gradient(to bottom, ${dominantColor}bf 0%, #1f1f1fbf 60%)`,
            }}
          />
          <div className="relative z-[1] flex gap-20 p-28">
            <div className="h-[128px] w-[128px] flex-shrink-0 overflow-hidden rounded-[1px] bg-gray-700 shadow-sm">
              {selectedPlaylist.tracks[0]?.album.images[0] && (
                <img
                  src={selectedPlaylist.tracks[0].album.images[0].url}
                  alt={selectedPlaylist.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="mr-20 min-w-0 flex-grow pt-16">
              <h1
                className="mb-8 overflow-hidden text-ellipsis whitespace-nowrap font-black leading-[1.2] text-white"
                style={{ fontSize: titleFontSize }}
              >
                {selectedPlaylist.name}
              </h1>
              <p className="pl-2 text-gray-200">
                {selectedPlaylist.description}
              </p>
            </div>
          </div>

          {/* Tracks List */}
          <div className="relative z-[1] flex flex-col space-y-2 bg-[rgba(0,0,0,0.12)] py-16">
            {selectedPlaylist.tracks.map((track, index) => (
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
                  {String(
                    Math.floor((track.duration_ms % 60000) / 1000),
                  ).padStart(2, "0")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
