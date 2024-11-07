import PlaylistInput from "@/components/PlaylistInput";

export default function Home() {
  // Define suggestions as nested arrays, each sub-array represents a row
  const suggestions = [
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

  return (
    <div className="flex min-h-screen flex-col items-center p-8 pt-[24vh] text-white">
      {/* Heading */}
      <h1 className="text-heading mb-[72px] font-black">
        Generate your first playlist
      </h1>

      {/* Input field with button */}
      <PlaylistInput />

      {/* Suggestions */}
      <div className="mt-20 flex w-full flex-col items-center gap-6">
        {suggestions.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-wrap justify-center gap-4">
            {row.map((suggestion, suggestionIndex) => (
              <button
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
