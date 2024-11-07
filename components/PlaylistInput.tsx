"use client";

import { useRef } from "react";
import { signInWithSpotify } from "@/app/actions-auth";
import { auth } from "@/auth";

export default function PlaylistInput() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function generatePlaylist() {}

  return (
    <div
      className="bg-background-input shadow-innerGlow relative flex w-full max-w-[532px] cursor-text flex-col rounded border border-[#fff]/[.12] px-[24px] pb-[20px] pt-[16px]"
      onClick={() => textareaRef.current?.focus()}
    >
      <textarea
        ref={textareaRef}
        rows={2}
        placeholder="Describe what would you like to listen..."
        className="text-foreground-light mb-24 h-64 w-full resize-none bg-[inherit] leading-[32px] placeholder-gray-300 focus:outline-none"
      />
      <button
        onClick={signInWithSpotify}
        className="border-border-brand bottom-4 right-4 ml-auto cursor-default rounded-full border bg-green-500 px-[22px] py-[12px] text-black transition-colors"
      >
        Generate playlist
      </button>
    </div>
  );
}
