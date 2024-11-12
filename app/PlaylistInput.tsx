"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import GenerateButton from "@/app/GenerateButton";
import { motion } from "framer-motion";

interface PlaylistInputProps {
  showSuggestions?: boolean;
  onSubmit: (description: string) => Promise<void>;
  className?: string;
  submitText?: string;
  placeholderText?: string;
  isLoading: boolean;
  collapsable?: boolean;
  variant?: "dark" | "gray";
}

export default function PlaylistInput({
  showSuggestions = false,
  onSubmit,
  className,
  submitText = "Generate playlist",
  placeholderText = "Describe what would you like to listen...",
  isLoading,
  collapsable = false,
  variant = "dark",
}: PlaylistInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [playlistDescriptionInput, setPlaylistDescriptionInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const isCollapsed = collapsable && !isFocused;

  return (
    <div className={clsx("flex flex-col items-center gap-20", className)}>
      <motion.div
        layoutId="playlist-input"
        className={clsx(
          "relative flex w-full max-w-full cursor-text flex-col rounded border border-input px-[24px] shadow-innerGlow",
          isCollapsed ? "py-[16px]" : "pb-[20px] pt-[16px]",
          variant === "dark" ? "bg-gray-800" : "bg-[#303030]",
        )}
        transition={{
          layout: { duration: 0.25, type: "spring", bounce: 0 },
          layoutChildren: { duration: 0.25, type: "spring", bounce: 0 },
        }}
        onClick={() => textareaRef.current?.focus()}
      >
        <motion.textarea
          layout="position"
          value={playlistDescriptionInput}
          onChange={(e) => setPlaylistDescriptionInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          ref={textareaRef}
          rows={isCollapsed ? 1 : 2}
          placeholder={placeholderText}
          className={clsx(
            "w-full resize-none bg-[inherit] leading-[32px] text-foreground-light placeholder-gray-300 focus:outline-none",
            isCollapsed ? "h-[32px]" : "mb-64 h-64",
          )}
        />
        <motion.div
          layout
          className="absolute"
          initial={false}
          animate={{
            bottom: isCollapsed ? 10 : 16,
          }}
          transition={{
            bottom: { duration: 0.4, type: "spring", bounce: 0 },
          }}
          style={{
            right: 20,
            zIndex: 1000000,
            willChange: "transform",
          }}
        >
          <GenerateButton
            onClick={() => onSubmit(playlistDescriptionInput)}
            size="sm"
            text={submitText}
          />
        </motion.div>
      </motion.div>

      {showSuggestions && (
        <div className="flex w-full flex-col items-center gap-6">
          {DEFAULT_SUGGESTIONS.map((row, rowIndex) => (
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
      )}
    </div>
  );
}

const DEFAULT_SUGGESTIONS = [
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
