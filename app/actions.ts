import {
  getSpotifyTrack,
  createPlaylist,
  TrackInterface,
} from "./actions-spotify";
import { getGeneratedTrackList } from "./actions-openai";

export interface PlaylistInterface {
  id: string;
  name: string;
  description: string;
  tracks: TrackInterface[];
}

export async function generatePlaylist({
  playlistDescription,
  songCount = 20,
}: {
  playlistDescription: string;
  songCount?: number;
}): Promise<PlaylistInterface> {
  try {
    debugger;
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

    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      tracks,
    };
  } catch (error) {
    throw new Error("Failed to generate playlist", { cause: error });
  }
}
