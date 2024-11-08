"use client";

import { useRef, useState } from "react";
import { signInWithSpotify } from "@/app/actions-auth";
import { generatePlaylist } from "@/app/actions";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { openDB } from "idb";

const SUGGESTIONS = [
  [
    "give me some best rap/trap underground music",
    "90s pop",
    "hmm, I want some melodic sounds, genre doesn't matter",
  ],
  ["90s pop", "10 most popular songs from 2000s", "most popular hard metal"],
  [
    "mix of best songs in wide variety of genres",
    "1950s",
    "hey, classics of all genres",
  ],
  ["classics of all genres", "going to the beach vibe"],
  ["classics of all genres"],
  ["90s pop", "hmm, I want some melodic sounds, genre doesn't matter"],
  ["90s pop", "10 most popular songs from 2000s", "most popular hard metal"],
  ["1950s", "hey, classics of all genres"],
  ["classics of all genres", "going to the beach vibe"],
];

export default function PlaylistInput() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [playlistDescriptionInput, setPlaylistDescriptionInput] = useState("");
  const [isLoading, setIsLoading] = useState(
    searchParams.get("generate") !== null,
  );

  async function handleGeneratePlaylist() {
    if (!session?.user) {
      signInWithSpotify(`/?generate=${playlistDescriptionInput}`);
      return;
    }

    const playlist = await generatePlaylist({
      playlistDescription: playlistDescriptionInput,
    });

    const db = await openDB("playlistsDB", 1, {
      upgrade(db) {
        db.createObjectStore("playlists", { keyPath: "id" });
      },
    });

    const timestamp = new Date().toISOString();
    await db.put("playlists", {
      ...playlist,
      created_at: timestamp,
      updated_at: timestamp,
    });

    // Save playlist to indexDB
  }

  return (
    <div className="flex flex-col items-center gap-20">
      <div
        className="relative flex w-full max-w-[532px] cursor-text flex-col rounded border border-[#fff]/[.12] bg-background-input px-[24px] pb-[20px] pt-[16px] shadow-innerGlow"
        onClick={() => textareaRef.current?.focus()}
      >
        <textarea
          value={playlistDescriptionInput}
          onChange={(e) => setPlaylistDescriptionInput(e.target.value)}
          ref={textareaRef}
          rows={2}
          placeholder="Describe what would you like to listen..."
          className="mb-24 h-64 w-full resize-none bg-[inherit] leading-[32px] text-foreground-light placeholder-gray-300 focus:outline-none"
        />
        <button
          onClick={handleGeneratePlaylist}
          className="bottom-4 right-4 ml-auto cursor-default rounded-full border border-border-brand bg-green-500 px-[22px] py-[12px] text-black transition-colors"
        >
          Generate playlist
        </button>
      </div>
      <div className="flex w-full flex-col items-center gap-6">
        {SUGGESTIONS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-wrap justify-center gap-4">
            {row.map((suggestion, suggestionIndex) => (
              <button
                onClick={() => setPlaylistDescriptionInput(suggestion)}
                key={`${rowIndex}-${suggestionIndex}`}
                className="cursor-default rounded-full border border-gray-700 bg-transparent px-16 py-4 text-sm text-gray-500 transition-colors hover:bg-neutral-700/50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
