"use server";

import { auth } from "@/auth";
import { TrackInterface } from "./types";

const SPOTIFY_API_URL = "https://api.spotify.com/v1";

async function getAuthenticatedSession() {
  const session = await auth();
  if (!session?.access_token) {
    throw new Error("No Spotify access token found");
  }
  return session;
}

export async function getSpotifyTrack({
  trackAuthor,
  trackName,
}: {
  trackAuthor: string;
  trackName: string;
}): Promise<TrackInterface | null> {
  try {
    const session = await getAuthenticatedSession();

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
      spotify_id: track.id,
      spotify_uri: track.uri,
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

export async function createSpotifyPlaylist({
  name = "My Generated Playlist",
  description = "Playlist created by my app",
}: {
  name?: string;
  description?: string;
}): Promise<{
  id: string;
  uri: string;
}> {
  const session = await getAuthenticatedSession();

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

  if (!createPlaylistResponse.ok) {
    throw new Error(
      `SpotifyAPI error, failed to create playlist: ${createPlaylistResponse.status}`,
    );
  }

  const playlist = await createPlaylistResponse.json();
  return {
    id: playlist.id,
    uri: playlist.uri,
  };
}

export async function addTracksToSpotifyPlaylist({
  playlistId,
  tracks,
}: {
  playlistId: string;
  tracks: string[];
}): Promise<{ snapshot_id: string }> {
  const session = await getAuthenticatedSession();

  const addTracksResponse = await fetch(
    `${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
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

  const response = await addTracksResponse.json();
  return { snapshot_id: response.snapshot_id };
}

export async function playSpotifyTrack({
  trackUri,
  deviceId,
  contextUri,
}: {
  trackUri: string;
  deviceId: string | null;
  contextUri: string | null;
}): Promise<void> {
  try {
    const session = await getAuthenticatedSession();

    const deviceQueryParam = deviceId ? `?device_id=${deviceId}` : "";
    const response = await fetch(
      `${SPOTIFY_API_URL}/me/player/play${deviceQueryParam}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          contextUri
            ? {
                context_uri: contextUri,
                offset: {
                  uri: trackUri,
                },
              }
            : {
                uris: [trackUri],
              },
        ),
      },
    );

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

export async function replaceSpotifyPlaylistTracks({
  playlistId,
  trackURIs,
}: {
  playlistId: string;
  trackURIs: string[];
}): Promise<{ snapshot_id: string }> {
  try {
    const session = await getAuthenticatedSession();

    const replaceTracksResponse = await fetch(
      `${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: trackURIs,
        }),
      },
    );

    if (!replaceTracksResponse.ok) {
      throw new Error(
        `SpotifyAPI error, failed to update playlist: ${replaceTracksResponse.status}`,
      );
    }

    const response = await replaceTracksResponse.json();
    return { snapshot_id: response.snapshot_id };
  } catch (error) {
    console.error("Error updating playlist:", error);
    throw error;
  }
}
