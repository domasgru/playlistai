"use server";

import { auth } from "@/auth";
import { TrackInterface } from "./types";

const SPOTIFY_API_URL = "https://api.spotify.com/v1";

export async function getSpotifyTrack({
  trackAuthor,
  trackName,
}: {
  trackAuthor: string;
  trackName: string;
}): Promise<TrackInterface | null> {
  try {
    const session = await auth();

    if (!session?.access_token) {
      throw new Error("No Spotify access token found");
    }

    const searchQuery = encodeURIComponent(`${trackAuthor} ${trackName}`);

    const response = await fetch(
      `${SPOTIFY_API_URL}/search?q=${searchQuery}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();
    const track = data.tracks?.items[0];

    if (!track) {
      return null;
    }

    return {
      id: track.id,
      uri: track.uri,
      name: track.name,
      duration_ms: track.duration_ms,
      external_spotify_url: track.external_urls.spotify,
      album: {
        id: track.album.id,
        type: track.album.type,
        name: track.album.name,
        release_date: track.album.release_date,
        images: track.album.images,
        external_spotify_url: track.album.external_urls.spotify,
      },
      artists: track.artists.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        external_spotify_url: artist.external_urls.spotify,
      })),
    };
  } catch (error) {
    console.error("Error searching Spotify:", error);
    return null;
  }
}

export async function createPlaylist({
  tracks,
  name = "My Generated Playlist",
  description = "Playlist created by my app",
}: {
  tracks: string[];
  name?: string;
  description?: string;
}): Promise<{ id: string; name: string; description: string }> {
  const session = await auth();
  if (!session?.access_token) {
    throw new Error("No Spotify access token found");
  }

  const createPlaylistResponse = await fetch(
    `${SPOTIFY_API_URL}/users/${session.account_id}/playlists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        public: false,
      }),
    },
  );

  const playlist = await createPlaylistResponse.json();

  if (!createPlaylistResponse.ok) {
    throw new Error(
      `SpotifyAPI error, failed to create playlist: ${createPlaylistResponse.status}`,
    );
  }

  const addTracksResponse = await fetch(
    `${SPOTIFY_API_URL}/playlists/${playlist.id}/tracks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: tracks,
      }),
    },
  );

  if (!addTracksResponse.ok) {
    throw new Error(
      `SpotifyAPI error, failed to add tracks: ${addTracksResponse.status}`,
    );
  }

  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
  };
}

export async function playTrack(trackUri: string): Promise<void> {
  try {
    const session = await auth();
    if (!session?.access_token) {
      throw new Error("No Spotify access token found");
    }

    const response = await fetch(`${SPOTIFY_API_URL}/me/player/play`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: [trackUri],
      }),
    });

    if (!response.ok) {
      // If no active device is found, this will help with debugging
      if (response.status === 404) {
        throw new Error("No active Spotify device found");
      }
      throw new Error(`Spotify API error: ${response.status}`);
    }
  } catch (error) {
    console.error("Error playing track:", error);
    throw error;
  }
}
