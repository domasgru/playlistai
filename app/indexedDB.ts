import { openDB } from "idb";
import { PlaylistInterface } from "@/app/actions";

export async function getAllPlaylists(): Promise<PlaylistInterface[]> {
  const db = await openDB("playlistsDB", 1);
  const playlists = await db.getAll("playlists");
  return playlists;
}
