import { openDB, type DBSchema, IDBPDatabase } from "idb";
import { PlaylistInterface } from "@/app/types";

interface PlaylistDB extends DBSchema {
  playlists: {
    key: string;
    value: PlaylistInterface;
  };
}

class DatabaseService {
  private static instance: DatabaseService;
  private dbPromise: Promise<IDBPDatabase<PlaylistDB>> | null;

  private constructor() {
    this.dbPromise = null;
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async getDB() {
    // Guard clause for server-side
    if (typeof window === "undefined") {
      return null;
    }

    try {
      if (!this.dbPromise) {
        this.dbPromise = openDB<PlaylistDB>("playlistsDB", 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains("playlists")) {
              db.createObjectStore("playlists", { keyPath: "id" });
            }
          },
          blocked() {
            console.warn(
              "Database blocked: waiting for other instances to close",
            );
          },
          blocking() {
            console.warn("Database blocking: closing other instances");
          },
          terminated() {
            console.error("Database terminated unexpectedly");
          },
        });
      }
      return this.dbPromise;
    } catch (error) {
      console.error("Failed to open database:", error);
      return null;
    }
  }
}

// Export a function to get the database instance
export async function getPlaylistDB() {
  return DatabaseService.getInstance().getDB();
}

// Helper functions for common operations
export async function savePlaylist(playlist: PlaylistInterface) {
  const db = await getPlaylistDB();
  if (!db) return null;

  try {
    return await db.put("playlists", playlist);
  } catch (error) {
    console.error("Failed to save playlist:", error);
    return null;
  }
}

export async function getPlaylist(id: string) {
  const db = await getPlaylistDB();
  if (!db) return null;

  try {
    return await db.get("playlists", id);
  } catch (error) {
    console.error("Failed to get playlist:", error);
    return null;
  }
}

export async function getAllPlaylists() {
  const db = await getPlaylistDB();
  if (!db) return null;

  try {
    return await db.getAll("playlists");
  } catch (error) {
    console.error("Failed to get all playlists:", error);
    return null;
  }
}
