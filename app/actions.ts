"use server";

import { getSpotifyTrack, createPlaylist } from "./actions-spotify";
import { getGeneratedTrackList } from "./actions-openai";
import { PlaylistInterface } from "./types";
import { nanoid } from "nanoid";

export async function generatePlaylist({
  playlistDescription,
  songCount = 20,
  uploadToSpotify = true,
}: {
  playlistDescription: string;
  songCount?: number;
  uploadToSpotify?: boolean;
}): Promise<PlaylistInterface> {
  try {
    const { tracks: generatedTracks, playlistName } =
      await getGeneratedTrackList({
        prompt: playlistDescription,
        count: songCount,
      });

    const unfilteredTracks = await Promise.all(
      generatedTracks.map((song) => getSpotifyTrack(song)),
    );
    const tracks = unfilteredTracks.filter((track) => track !== null);
    const tracksURIList = tracks.map((track) => track.uri);

    let playlist;
    if (uploadToSpotify) {
      playlist = await createPlaylist({
        tracks: tracksURIList,
        name: playlistName,
        description: playlistDescription,
      });
    }

    const timestamp = new Date().toISOString();

    return {
      id: nanoid(8),
      spotify_id: playlist?.id,
      name: playlistName,
      description: playlistDescription,
      tracks,
      generated_tracks: generatedTracks,
      created_at: timestamp,
      updated_at: timestamp,
    };
  } catch (error) {
    throw new Error(`Failed to generate playlist ${error}`);
  }
}
