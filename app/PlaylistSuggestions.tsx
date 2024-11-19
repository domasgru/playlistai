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
            //opacity: 0,
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
              className="cursor-default rounded-full border border-gray-700 bg-white/[0.03] px-16 py-4 text-sm text-[#808080] hover:bg-neutral-700/50"
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
