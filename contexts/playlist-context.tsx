"use client";

import { PlaylistInterface } from "@/app/_types";
import * as React from "react";
import { useLocalStorage } from "usehooks-ts";
import { getAllPlaylists } from "@/app/db";
import demoPlaylists from "@/data/demo-playlists.json";
import { isDemoMode } from "@/utils/isDemoMode";

interface PlaylistApiContextType {
  setSelectedPlaylistId: React.Dispatch<React.SetStateAction<string | null>>;
  setPlaylists: React.Dispatch<React.SetStateAction<PlaylistInterface[]>>;
}

interface PlaylistDataContextType {
  playlists: PlaylistInterface[];
  selectedPlaylistId: string | null;
  selectedPlaylist: PlaylistInterface | undefined;
  isLoadingPlaylists: boolean;
}

const PlaylistApiContext = React.createContext<
  PlaylistApiContextType | undefined
>(undefined);

const PlaylistDataContext = React.createContext<
  PlaylistDataContextType | undefined
>(undefined);

let hasLoadedPlaylists = false;

export const PlaylistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoadingPlaylists, setIsLoadingPlaylists] = React.useState(true);
  const [playlists, setPlaylists] = React.useState<PlaylistInterface[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useLocalStorage<
    string | null
  >("selectedPlaylistId", null);
  const selectedPlaylist = playlists.find(
    (playlist) => playlist.id === selectedPlaylistId,
  );

  async function loadPlaylists() {
    try {
      const loadedPlaylists = isDemoMode
        ? demoPlaylists
        : await getAllPlaylists();

      if (!loadedPlaylists) return;

      const sortedPlaylists = loadedPlaylists.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setPlaylists(sortedPlaylists);
      if (
        sortedPlaylists.length > 0 &&
        (!selectedPlaylistId ||
          !sortedPlaylists.find(
            (playlist) => playlist.id === selectedPlaylistId,
          ))
      ) {
        setSelectedPlaylistId(sortedPlaylists[0].id);
      }
    } catch (error) {
      console.error("Error while loading playlists:", error);
    } finally {
      setIsLoadingPlaylists(false);
    }
  }

  React.useEffect(() => {
    if (hasLoadedPlaylists) return;

    loadPlaylists();
    hasLoadedPlaylists = true;
  }, []);

  return (
    <PlaylistApiContext.Provider
      value={{ setSelectedPlaylistId, setPlaylists }}
    >
      <PlaylistDataContext.Provider
        value={{
          playlists,
          selectedPlaylistId,
          selectedPlaylist,
          isLoadingPlaylists,
        }}
      >
        {children}
      </PlaylistDataContext.Provider>
    </PlaylistApiContext.Provider>
  );
};

export function usePlaylistDataContext() {
  const context = React.useContext(PlaylistDataContext);
  if (!context) {
    throw new Error(
      "usePlaylistDataContext must be used within a PlaylistDataProvider",
    );
  }
  return context;
}

export function usePlaylistApiContext() {
  const context = React.useContext(PlaylistApiContext);
  if (!context) {
    throw new Error(
      "usePlaylistApiContext must be used within a PlaylistApiProvider",
    );
  }
  return context;
}
