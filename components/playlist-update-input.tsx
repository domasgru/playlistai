import PlaylistInput from "@/components/playlist-input";
import { useState } from "react";
import { toast } from "sonner";

interface PlaylistUpdateInputProps {
  onSubmit: (value: string) => void;
  isLoading: boolean;
  isDemoMode: boolean;
}

export default function PlaylistUpdateInput({
  onSubmit,
  isLoading,
  isDemoMode,
}: PlaylistUpdateInputProps) {
  const [inputValue, setInputValue] = useState("");

  function handleSubmit() {
    if (isDemoMode) {
      toast("Sorry you can't update playlists yet, this is a demo mode.", {
        description: "Waiting for the Spotify to approve this app.",
      });
      return;
    }
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
      placeholderText="Describe what would you like to listen..."
      isLoading={isLoading}
      collapsable={true}
      backgroundColor="gray"
    />
  );
}
