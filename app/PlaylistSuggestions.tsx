import { motion } from "framer-motion";

export default function PlaylistSuggestions({
  onSelect,
}: {
  onSelect: (suggestion: string) => void;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      {DEFAULT_SUGGESTIONS.map((row, rowIndex) => (
        <motion.div
          key={rowIndex}
          className="flex flex-wrap justify-center gap-x-4 gap-y-6"
          exit={{
            y: 500,
            scale: 0.9,
            transition: {
              type: "spring",
              duration: 0.3,
              bounce: 0,
              delay: (DEFAULT_SUGGESTIONS.length - 1 - rowIndex) * 0.0125,
            },
          }}
          initial={{ opacity: 1, y: 0 }}
        >
          {row.map((suggestion, suggestionIndex) => (
            <button
              onClick={() => onSelect(suggestion)}
              key={`${rowIndex}-${suggestionIndex}`}
              className="cursor-default rounded-full border border-[#2E2E2E] bg-white/[0.01] px-16 py-2 text-sm text-[#707070] hover:bg-white/[0.03]"
            >
              {suggestion}
            </button>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

const DEFAULT_SUGGESTIONS = [
  [
    "give me some underground rap/trap gems",
    "90s pop",
    "hmm, I want some melodic tunes, genre doesn't matter",
  ],
  [
    "rock",
    "I want to relax, give me some chill music",
    "hey, classics of all genres",
  ],
  [
    "I mostly listen to rap and r&b — recommend other genres I’d likely enjoy based on my taste",
  ],
  ["Songs with iconic cover art", "Michael Jackson's greatest hits"],

  ["best of Playboi Carti"],
  ["love fred again, flume, salute, give me something new but similar", "rap"],
  [
    "I want to explore classic music—create the perfect starter playlist for me",
    "chill electronic music for late night",
  ],
  ["gym playlist, I like hip hop, r&b and rock"],
  ["hidden gems of 80s synthwave", "top 10 upbeat indie tracks"],
  ["best modern classical music", "starter metal playlist"],
  ["vibes for a rainy autumn day"],
  ["most underrated techno tracks", "songs for late-night drives"],
  ["1950s classics", "perfect beach day playlist", "songs to boost your mood"],
];
