export interface PlaylistInterface {
  id: string;
  spotify_id: string | null;
  spotify_uri: string | null;
  name: string;
  description: string;
  tracks: TrackInterface[];
  generated_tracks?: GeneratedTrackInterface[];
  created_at: string;
  updated_at: string;
}

export interface TrackInterface {
  spotify_id: string;
  spotify_uri: string;
  name: string;
  duration_ms: number;
  external_spotify_url: string;
  album: {
    id: string;
    type: string;
    name: string;
    release_date: string;
    images: {
      url: string;
    }[];
    external_spotify_url: string;
  };
  artists: {
    id: string;
    name: string;
    external_spotify_url: string;
  }[];
}

export interface GeneratedTrackInterface {
  trackAuthor: string;
  trackName: string;
}

export interface PlayerStateInterface {
  isPaused: boolean;
  currentTrackId: string;
  currentTrackUri: string;
  position: number;
  duration: number;
}

export interface CoverModalDataInterface {
  layoutId: string;
  coverUrl: string;
}
