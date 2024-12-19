"use client";

import { useSession } from "next-auth/react";
import PlaylistGenerator from "../components/playlist-generator";
import FullscreenLoader from "../components/fullscreen-loader";
import { usePlaylistDataContext } from "@/contexts/playlist-context";

export default function Home() {
  const { status } = useSession();
  const { isLoadingPlaylists } = usePlaylistDataContext();
  const hasInitialized = status !== "loading" && !isLoadingPlaylists;

  return hasInitialized ? <PlaylistGenerator /> : <FullscreenLoader />;
}
