"use client";

import { useRef, useState, useEffect } from "react";
import PlaylistInput from "@/app/PlaylistInput";
import PlaylistSuggestions from "@/app/PlaylistSuggestions";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import PlaylistSkeleton from "@/app/PlaylistSkeleton";
import { signInWithSpotify } from "./actions-auth";
import Image from "next/image";
interface PlaylistEmptyScreenProps {
  onSubmit: (input: string) => void;
  isLoggedIn: boolean;
  isLoading: boolean;
}

export default function PlaylistEmptyScreen({
  onSubmit,
  isLoading,
  isLoggedIn,
}: PlaylistEmptyScreenProps) {
  const [input, setInput] = useState(
    () => sessionStorage.getItem("generate") || "",
  );
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      if (
        e.key.toLowerCase() === "l" &&
        !isLoggedIn &&
        !isLoading &&
        document.activeElement !== inputRef.current
      ) {
        signInWithSpotify();
      }
    }

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isLoading, isLoggedIn]);

  function handleSuggestionSelect(suggestion: string) {
    setInput(suggestion);
    inputRef.current?.focus();
  }

  return (
    <div
      className={clsx(
        "flex h-full w-full flex-col items-center text-white",
        isLoading ? "pb-24 pt-24" : "pt-[24vh]",
      )}
    >
      <Image
        className="absolute left-24 top-[39px] opacity-[0.85] sm:left-auto"
        src="/logo.png"
        alt="Playlistai"
        width={131}
        height={31.7}
      />
      {!isLoggedIn && !isLoading && (
        <button
          className="group absolute right-24 top-[36px] mx-auto flex items-center gap-10 rounded-full border border-input bg-gray-800 px-16 py-8 text-[16px] leading-[22px] text-gray-300 hover:text-white sm:right-48"
          onClick={() => signInWithSpotify()}
        >
          Login with Spotify
          <span className="flex h-20 w-20 items-center justify-center rounded-[3px] bg-[#3A3A3A] text-[14px] font-medium shadow-[0_1px_1px_0_rgba(0,0,0,0.26),inset_0_0.5px_1px_0_rgba(255,255,255,0.13)] group-hover:text-gray-300">
            L
          </span>
        </button>
      )}
      <AnimatePresence mode="popLayout">
        {!isLoading && (
          <motion.h1
            className="mb-[70px] text-center text-heading font-black"
            exit={{ y: -300, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0 }}
          >
            Turn ideas into Playlists. <br /> For Spotify Premium.
          </motion.h1>
        )}
      </AnimatePresence>
      <div className="z-10 flex h-full w-full flex-col items-center gap-20">
        <motion.div
          layout
          initial={false}
          animate={{ width: isLoading ? 592 : 560 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0, delay: 0.05 }}
          className="max-w-full"
        >
          <PlaylistInput
            ref={inputRef}
            className="w-full max-w-full"
            value={input}
            onChange={setInput}
            onSubmit={() => onSubmit(input)}
            isLoading={isLoading}
          />
        </motion.div>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 200, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 150, scale: 0.9 }}
            transition={{
              duration: 0.35,
              type: "spring",
              bounce: 0,
              delay: 0.15,
            }}
            className="flex-grow-1 h-full w-full max-w-[592px] overflow-hidden"
          >
            <PlaylistSkeleton />
          </motion.div>
        )}
        <AnimatePresence mode="popLayout">
          {!isLoading && (
            <motion.div className="w-[100vw] px-20 pb-20">
              <PlaylistSuggestions onSelect={handleSuggestionSelect} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
