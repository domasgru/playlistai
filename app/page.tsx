"use client";

import { Suspense } from "react";
import PlaylistGenerator from "./PlaylistGenerator";
import FullscreenLoader from "./FullscreenLoader";

export default function Home() {
  return (
    <Suspense fallback={<FullscreenLoader />}>
      <PlaylistGenerator />
    </Suspense>
  );
}
