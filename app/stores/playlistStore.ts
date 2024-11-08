import { create } from "zustand";
import { PlaylistInterface } from "@/app/actions";
import { getAllPlaylists } from "@/app/indexedDB";
import { openDB } from "idb";

interface PlaylistStore {
  playlists: PlaylistInterface[];
  isLoading: boolean;
  initializePlaylists: () => Promise<void>;
  addPlaylist: (playlist: PlaylistInterface) => Promise<void>;
  updatePlaylist: (
    playlistId: string,
    updates: Partial<PlaylistInterface>,
  ) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: [],
  isLoading: true,

  initializePlaylists: async () => {
    const playlists = await getAllPlaylists();
    set({ playlists, isLoading: false });
  },

  addPlaylist: async (playlist) => {
    set((state) => ({
      playlists: [...state.playlists, playlist],
    }));

    try {
      const db = await openDB("playlistsDB", 1);
      await db.put("playlists", playlist);
    } catch (error) {
      set((state) => ({
        playlists: state.playlists.filter((p) => p.id !== playlist.id),
      }));
      throw error;
    }
  },

  updatePlaylist: async (playlistId, updates) => {
    const currentPlaylist = get().playlists.find((p) => p.id === playlistId);
    if (!currentPlaylist) return;

    const updatedPlaylist = {
      ...currentPlaylist,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    set((state) => ({
      playlists: state.playlists.map((p) =>
        p.id === playlistId ? updatedPlaylist : p,
      ),
    }));

    try {
      const db = await openDB("playlistsDB", 1);
      await db.put("playlists", updatedPlaylist);
    } catch (error) {
      set((state) => ({
        playlists: state.playlists.map((p) =>
          p.id === playlistId ? currentPlaylist : p,
        ),
      }));
      throw error;
    }
  },

  deletePlaylist: async (playlistId) => {
    const playlistToDelete = get().playlists.find((p) => p.id === playlistId);

    set((state) => ({
      playlists: state.playlists.filter((p) => p.id !== playlistId),
    }));

    try {
      const db = await openDB("playlistsDB", 1);
      await db.delete("playlists", playlistId);
    } catch (error) {
      if (playlistToDelete) {
        set((state) => ({
          playlists: [...state.playlists, playlistToDelete],
        }));
      }
      throw error;
    }
  },
}));
