import PlaylistInput from "@/app/PlaylistInput";
import { useState } from "react";

interface PlaylistUpdateInputProps {
  onSubmit: (value: string) => void;
  isLoading: boolean;
}

export default function PlaylistUpdateInput({
  onSubmit,
  isLoading,
}: PlaylistUpdateInputProps) {
  const [inputValue, setInputValue] = useState("");

  function handleSubmit() {
    onSubmit(inputValue);
    setInputValue("");
  }

  return (
    <PlaylistInput
      className="absolute bottom-1 left-1 right-1 z-10 px-12 py-12 pt-36"
      value={inputValue}
      onChange={setInputValue}
      onSubmit={handleSubmit}
      submitButtonText="Update"
      placeholderText="Describe what you want to update..."
      isLoading={isLoading}
      collapsable={true}
      backgroundColor="gray"
    />
  );
}
