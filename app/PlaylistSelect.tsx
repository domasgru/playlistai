import { PlaylistInterface } from "@/app/types";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import ChevronDown from "@/public/chevron-down.svg";

export default function PlaylistSelect({
  playlists,
  selectedPlaylist,
  onSelectPlaylist,
}: {
  playlists: PlaylistInterface[];
  selectedPlaylist: PlaylistInterface | null;
  onSelectPlaylist: (selectedPlaylist: PlaylistInterface) => void;
}) {
  return (
    <Listbox
      value={selectedPlaylist}
      onChange={onSelectPlaylist}
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
          {selectedPlaylist?.name || "Select selectedPlaylist"}
        </span>
        <ChevronDown className="h-28 w-28" />
      </ListboxButton>

      <ListboxOptions className="border-input absolute z-10 mt-4 w-full overflow-hidden rounded border bg-gray-800 py-4 shadow-innerGlow">
        {playlists.map((selectedPlaylist) => (
          <ListboxOption
            key={selectedPlaylist.id}
            value={selectedPlaylist}
            className="flex w-full items-center gap-12 px-16 py-8 text-left hover:cursor-default hover:bg-gray-700"
          >
            <img
              src={
                selectedPlaylist.tracks[0]?.album.images[
                  selectedPlaylist.tracks[0]?.album.images.length - 1
                ].url
              }
              alt=""
              className="h-32 w-32 rounded"
            />
            <span className="truncate">{selectedPlaylist.name}</span>
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}
