"use client";

import { Suspense } from "react";
import PlaylistGenerator from "../components/playlist-generator";
import FullscreenLoader from "../components/fullscreen-loader";

export default function Home() {
  return (
    <Suspense fallback={<FullscreenLoader />}>
      <PlaylistGenerator />
    </Suspense>
  );
}
