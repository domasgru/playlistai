export interface PlaylistInterface {
  id: string;
  name: string;
  description: string;
  tracks: TrackInterface[];
  generated_tracks?: GeneratedTrackInterface[];
  created_at: string;
  updated_at: string;
}

export interface TrackInterface {
  id: string;
  uri: string;
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
