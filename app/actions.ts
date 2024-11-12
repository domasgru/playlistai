"use server";

import { getSpotifyTrack, createPlaylist } from "./actions-spotify";
import { getGeneratedTrackList } from "./actions-openai";
import { PlaylistInterface } from "./types";

export async function generatePlaylist({
  playlistDescription,
  songCount = 20,
}: {
  playlistDescription: string;
  songCount?: number;
}): Promise<PlaylistInterface> {
  try {
    const generatedTracks = await getGeneratedTrackList({
      prompt: playlistDescription,
      count: songCount,
    });

    const unfilteredTracks = await Promise.all(
      generatedTracks.map((song) => getSpotifyTrack(song)),
    );
    const tracks = unfilteredTracks.filter((track) => track !== null);
    const tracksURIList = tracks.map((track) => track.uri);

    const playlist = await createPlaylist({ tracks: tracksURIList });
    const timestamp = new Date().toISOString();

    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      tracks,
      generated_tracks: generatedTracks,
      created_at: timestamp,
      updated_at: timestamp,
    };
  } catch (error) {
    throw new Error(`Failed to generate playlist ${error}`);
  }
}
