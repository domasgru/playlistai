import { motion } from "framer-motion";
import clsx from "clsx";
import { useState } from "react";
import PlaylistInput from "@/app/PlaylistInput";
import PlaylistSuggestions from "@/app/PlaylistSuggestions";

interface PlaylistGenerateNewInputProps {
  isLoading: boolean;
  onSubmit: (prompt: string) => void;
  onMouseLeave: () => void;
  onEscape: () => void;
  onClickOutside: () => void;
}

export default function PlaylistGenerateNewInput({
  isLoading,
  onSubmit,
  onMouseLeave,
  onEscape,
  onClickOutside,
}: PlaylistGenerateNewInputProps) {
  const [inputValue, setInputValue] = useState("");

  return (
    <motion.div
      initial={{ y: -500, scale: 0.5 }}
      animate={{ y: 0, scale: 1 }}
      exit={{
        y: -500,
        scale: 0.8,
        transition: { duration: 0.6 },
      }}
      transition={{
        duration: 0.25,
        type: "spring",
        bounce: 0,
      }}
      className={clsx(
        "absolute top-[-40px] z-10 box-content w-full",
        !isLoading && "px-[150px] pb-[80px] pt-[40px]",
      )}
      onMouseLeave={onMouseLeave}
    >
      <PlaylistInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={() => onSubmit(inputValue)}
        isLoading={isLoading}
        onEscape={onEscape}
        onClickOutside={onClickOutside}
        backgroundColor="dark"
      />
    </motion.div>
  );
}
