"use server";

import {
  getSpotifyTrack,
  createSpotifyPlaylist,
  addTracksToSpotifyPlaylist,
  replaceSpotifyPlaylistTracks,
} from "./actions-spotify";
import { getGeneratedTrackList } from "./actions-openai";
import { PlaylistInterface } from "./types";
import { nanoid } from "nanoid";

function filterUniqueTracks<T extends { spotify_uri: string }>(
  tracks: T[],
): T[] {
  if (!tracks?.length) return [];

  const seen = new Set<string>();
  const uniqueTracks: T[] = [];

  for (const track of tracks) {
    if (!track.spotify_uri) {
      throw new Error("Track missing spotify_uri");
    }

    if (!seen.has(track.spotify_uri)) {
      seen.add(track.spotify_uri);
      uniqueTracks.push(track);
    }
  }

  return uniqueTracks;
}

export async function createPlaylist({
  playlistDescription,
  songCount = 20,
}: {
  playlistDescription: string;
  songCount?: number;
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
    const tracks = filterUniqueTracks(
      unfilteredTracks.filter((track) => track !== null),
    );
    const timestamp = new Date().toISOString();

    return {
      id: nanoid(8),
      spotify_id: null,
      spotify_uri: null,
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

export async function updatePlaylistInSpotify(
  playlist: PlaylistInterface,
): Promise<PlaylistInterface> {
  try {
    const trackURIs = playlist.tracks.map((track) => track.spotify_uri);
    const playlistId = playlist.spotify_id;

    if (!playlistId) {
      const newPlaylist = await createSpotifyPlaylist({
        name: playlist.name,
        description: playlist.description,
      });

      await addTracksToSpotifyPlaylist({
        playlistId: newPlaylist.id,
        tracks: trackURIs,
      });

      return {
        ...playlist,
        spotify_id: newPlaylist.id,
        spotify_uri: newPlaylist.uri,
      };
    }

    await replaceSpotifyPlaylistTracks({
      playlistId,
      trackURIs,
    });

    return playlist;
  } catch (error) {
    throw new Error(`Failed to update playlist: ${error}`);
  }
}
