import { useRef, useState, useEffect } from "react";
import PlaylistInput from "@/app/PlaylistInput";
import PlaylistSuggestions from "@/app/PlaylistSuggestions";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import PlaylistSkeleton from "@/app/PlaylistSkeleton";
import { signInWithSpotify } from "./actions-auth";

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
  const [input, setInput] = useState("");
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
        "flex h-full flex-col items-center text-white",
        isLoading ? "pb-24 pt-24" : "pt-[24vh]",
      )}
    >
      {!isLoggedIn && !isLoading && (
        <button
          className="absolute top-32 mx-auto flex items-center gap-10 rounded-full border border-input bg-gray-800 px-20 py-8 text-baseCompact text-gray-300 hover:text-white"
          onClick={() => signInWithSpotify()}
        >
          Login
          <span className="flex h-24 w-24 items-center justify-center rounded-[3px] bg-[#3A3A3A] text-[16px] font-medium shadow-[0_1px_1px_0_rgba(0,0,0,0.26),inset_0_0.5px_1px_0_rgba(255,255,255,0.13)]">
            L
          </span>
        </button>
      )}
      <AnimatePresence mode="popLayout">
        {!isLoading && (
          <motion.h1
            className="mb-[72px] text-heading font-black"
            exit={{ y: -300, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0 }}
          >
            Generate your first playlist
          </motion.h1>
        )}
      </AnimatePresence>
      <div className="z-10 flex h-full flex-col items-center gap-16">
        <motion.div
          layout
          initial={false}
          animate={{ width: isLoading ? 592 : 560 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0, delay: 0.05 }}
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
            <motion.div className="w-[100vw]">
              <PlaylistSuggestions onSelect={handleSuggestionSelect} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}