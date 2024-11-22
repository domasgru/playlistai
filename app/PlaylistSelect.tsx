import { PlaylistInterface } from "@/app/types";
import ChevronDown from "@/public/chevron-down.svg";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function PlaylistSelect({
  playlists,
  selectedPlaylist,
  onSelectPlaylist,
}: {
  playlists: PlaylistInterface[];
  selectedPlaylist: PlaylistInterface | null;
  onSelectPlaylist: (selectedPlaylist: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  function handleAnimationStart() {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 150);
  }

  return (
    <div
      className="relative flex w-full min-w-0 flex-1 select-none justify-center"
      style={{ WebkitUserSelect: "none" }}
    >
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        layoutId="playlist-select"
        className={`group flex w-full cursor-default select-none items-center rounded border border-input bg-gray-800 py-10 pl-16 pr-20 text-white shadow-innerGlow hover:bg-gray-750`}
        transition={{
          duration: 0.25,
          type: "spring",
          bounce: 0,
        }}
        style={{
          translateZ: 0,
          borderRadius: "16px",
          transformStyle: "preserve-3d",
        }}
      >
        {selectedPlaylist && (
          <motion.img
            layout="position"
            src={selectedPlaylist.tracks[0]?.album.images[0]?.url}
            alt="Album cover"
            className="mr-16 h-52 w-52 rounded-full saturate-[0.3] transition-[filter] duration-150 ease-in-out group-hover:saturate-[1]"
          />
        )}
        <motion.span layout="position" className="mr-auto truncate pr-16">
          {selectedPlaylist?.name || "Select selectedPlaylist"}
        </motion.span>
        <motion.div layoutId="playlist-chevron" layout="position">
          <ChevronDown className="h-28 w-28" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            layoutId="playlist-select"
            transition={{
              duration: 0.15,
              type: "spring",
              bounce: 0,
            }}
            style={{
              translateZ: 0,
              borderRadius: "16px",
              transformStyle: "preserve-3d",
            }}
            onMouseLeave={() => setIsOpen(false)}
            onLayoutAnimationStart={handleAnimationStart}
            onLayoutAnimationComplete={() => setIsAnimating(false)}
            className="absolute top-0 z-10 max-h-[228px] w-full select-none overflow-auto rounded border border-input bg-gray-800 py-12 shadow-elevationWithInnerGlow"
          >
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className={`flex w-full select-none items-center gap-12 px-16 py-12 text-left ${isAnimating ? "pointer-events-none" : "hover:cursor-default hover:bg-gray-700"}`}
                onClick={() => {
                  if (!isAnimating) {
                    onSelectPlaylist(playlist.id);
                    setIsOpen(false);
                  }
                }}
              >
                <motion.img
                  layout="position"
                  src={
                    playlist.tracks[0]?.album.images[
                      playlist.tracks[0]?.album.images.length - 1
                    ]?.url
                  }
                  alt=""
                  transition={{
                    duration: 0.15,
                    type: "spring",
                    bounce: 0,
                  }}
                  className="h-32 w-32 rounded"
                />
                <motion.span
                  layout="position"
                  className="truncate"
                  transition={{
                    duration: 0.15,
                    type: "spring",
                    bounce: 0,
                  }}
                >
                  {playlist.name}
                </motion.span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
