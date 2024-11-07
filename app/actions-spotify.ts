"use server";

import { auth } from "@/auth";

export async function getTrackURI({
  songAuthor,
  songTitle,
}: {
  songAuthor: string;
  songTitle: string;
}): Promise<string | null> {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      throw new Error("No Spotify access token found");
    }

    const searchQuery = encodeURIComponent(`${songAuthor} ${songTitle}`);

    // Call Spotify search API
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();

    // Check if we found any tracks
    if (data.tracks?.items?.length > 0) {
      return data.tracks.items[0].uri;
    }

    return null;
  } catch (error) {
    console.error("Error searching Spotify:", error);
    return null;
  }
}

export async function createPlaylist({
  tracks,
}: {
  tracks: string[];
}): Promise<string | null> {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      throw new Error("No Spotify access token found");
    }

    // Create a new playlist
    const createPlaylistResponse = await fetch(
      `https://api.spotify.com/v1/users/${session.user?.id}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "My Generated Playlist",
          description: "Playlist created by my app",
          public: false,
        }),
      },
    );

    if (!createPlaylistResponse.ok) {
      throw new Error(
        `Failed to create playlist: ${createPlaylistResponse.status}`,
      );
    }

    const playlist = await createPlaylistResponse.json();

    // Add tracks to the playlist
    const addTracksResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: tracks,
        }),
      },
    );

    if (!addTracksResponse.ok) {
      throw new Error(`Failed to add tracks: ${addTracksResponse.status}`);
    }

    return playlist.id;
  } catch (error) {
    console.error("Error creating playlist:", error);
    return null;
  }
}
