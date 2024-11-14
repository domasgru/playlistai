"use client";

import { useRef, useState, useEffect } from "react";
import clsx from "clsx";
import GenerateButton from "@/app/GenerateButton";
import { motion, AnimatePresence } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import GradientBlurBackground from "@/app/GradientBlurBackground";
import { Loader } from "./Loader";

interface PlaylistInputProps {
  showSuggestions?: boolean;
  onSubmit: (description: string) => Promise<void>;
  onClickOutside?: () => void;
  onMouseLeave?: () => void;
  onEscape?: () => void;
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
  onClickOutside,
  onMouseLeave,
  onEscape,
  className,
  submitText = "Generate playlist",
  placeholderText = "Describe what would you like to listen...",
  isLoading,
  collapsable = false,
  variant = "dark",
}: PlaylistInputProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [playlistDescriptionInput, setPlaylistDescriptionInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const isCollapsed = collapsable && !isFocused;

  useOnClickOutside(rootRef, () => {
    setIsFocused(false);
    onClickOutside?.();
  });

  function handleTextareaFocus() {
    setIsFocused(true);
    focusEndOfTextarea();
  }

  function handleMouseLeave() {
    setIsFocused(false);
    textareaRef.current?.blur();
    onMouseLeave?.();
  }

  useEffect(() => {
    if (!collapsable && textareaRef.current) {
      textareaRef.current.focus();
      focusEndOfTextarea();
    }
  }, [collapsable, textareaRef.current]);

  useEffect(() => {
    if (!isCollapsed) {
      window.requestAnimationFrame(() => {
        focusEndOfTextarea();
      });
    }
  }, [isCollapsed]);

  function focusEndOfTextarea() {
    const length = textareaRef.current?.value.length || 0;
    textareaRef.current?.setSelectionRange(length, length);
  }

  function handleSubmit() {
    onSubmit(playlistDescriptionInput);
    setIsFocused(false);
    setPlaylistDescriptionInput("");
  }

  return (
    <div
      ref={rootRef}
      className={clsx(
        "flex flex-col items-center gap-20 overflow-hidden rounded",
        isCollapsed && "pointer-events-none",
        className,
      )}
      onMouseLeave={handleMouseLeave}
    >
      {collapsable && (
        <GradientBlurBackground
          className={clsx(
            "absolute bottom-[0] top-0 h-full",
            isCollapsed && "pointer-events-none",
          )}
        />
      )}

      <motion.div
        layout
        className={clsx(
          "shadow-elevationWithInnerGlow pointer-events-auto relative flex w-full max-w-full cursor-text flex-col overflow-hidden rounded border border-input px-[24px] will-change-transform",
          "perspective-1000 backface-hidden transform-gpu",
          collapsable && isCollapsed ? "py-[16px]" : "pb-[20px] pt-[16px]",
          !collapsable && isLoading && "pb-[21px] pt-[21px]",
          variant === "dark" ? "bg-gray-800" : "bg-[#303030]",
        )}
        transition={{
          layout: {
            duration: 0.25,
            type: "spring",
            bounce: 0,
          },
          layoutChildren: {
            duration: 0.25,
            type: "spring",
            bounce: 0,
          },
        }}
        style={{
          translateZ: 0,
          borderRadius: "16px",
          transformStyle: "preserve-3d",
        }}
        onClick={() => textareaRef.current?.focus()}
      >
        {isLoading && (
          <div className="flex h-32 items-center gap-12">
            <Loader color="white" size={22} />
            <p className="text-base text-foreground-light">
              Generating playlist...
            </p>
          </div>
        )}
        {!isLoading && (
          <motion.textarea
            layout="position"
            value={playlistDescriptionInput}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setPlaylistDescriptionInput(e.target.value)
            }
            onFocus={handleTextareaFocus}
            ref={textareaRef}
            rows={isCollapsed ? 1 : 2}
            placeholder={placeholderText}
            className={clsx(
              "w-full resize-none bg-[inherit] leading-[32px] text-foreground-light placeholder-gray-300 focus:outline-none",
              isCollapsed ? "h-[32px]" : "mb-64 h-64",
            )}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              } else if (e.key === "Escape" && onEscape) {
                e.preventDefault();
                onEscape();
              }
            }}
          />
        )}
        <AnimatePresence>
          {!isCollapsed && !isLoading && (
            <motion.div
              layout
              className="absolute"
              initial={{
                opacity: 0,
                bottom: -20,
              }}
              animate={{
                opacity: 1,
                bottom: 16,
              }}
              exit={{
                bottom: -50,
              }}
              transition={{
                duration: 0.35,
                type: "spring",
                bounce: 0,
              }}
              style={{
                right: 20,
                zIndex: 1000000,
                willChange: "transform",
              }}
            >
              <GenerateButton
                onClick={handleSubmit}
                size="sm"
                text={submitText}
              />
            </motion.div>
          )}
        </AnimatePresence>
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
