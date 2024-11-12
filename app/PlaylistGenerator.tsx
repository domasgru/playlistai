"use client";

import PlaylistInput from "@/app/PlaylistInput";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { signInWithSpotify } from "@/app/actions-auth";
import { generatePlaylist } from "@/app/actions";
import { savePlaylist } from "@/app/db";
import { useState, useEffect } from "react";
import { PlaylistInterface } from "@/app/types";
import { getAllPlaylists } from "@/app/db";
import PlaylistView from "@/app/PlaylistView";
import GenerateButton from "@/app/GenerateButton";
import PlaylistSelect from "@/app/PlaylistSelect";

export default function PlaylistGenerator() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);
  const [isLoading, setIsLoading] = useState(
    searchParams.get("generate") !== null,
  );
  const [allPlaylists, setAllPlaylists] = useState<PlaylistInterface[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<PlaylistInterface | null>(null);

  const isInitializing = status === "loading" || isLoadingPlaylists;

  async function handleGeneratePlaylist(playlistDescriptionInput: string) {
    try {
      setIsLoading(true);

      if (!session?.user) {
        signInWithSpotify(`/?generate=${playlistDescriptionInput}`);
        return;
      }

      const playlist = await generatePlaylist({
        playlistDescription: playlistDescriptionInput,
      });

      await savePlaylist(playlist);
    } catch (error) {
      console.error("Failed to generate playlist:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const loadPlaylists = async () => {
      const loadedPlaylists = await getAllPlaylists();
      if (!loadedPlaylists) return;

      const sortedPlaylists = loadedPlaylists.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setAllPlaylists(sortedPlaylists);
      if (sortedPlaylists.length > 0) {
        setSelectedPlaylist(sortedPlaylists[0]);
      }

      setIsLoadingPlaylists(false);
    };
    loadPlaylists();
  }, []);

  return (
    <div>
      {isInitializing && (
        <div className="flex min-h-screen flex-col items-center p-8 pt-[24vh] text-white">
          <h1 className="mb-[72px] text-heading font-black">
            Loading your playlists...
          </h1>
        </div>
      )}

      {!isInitializing && (
        <>
          {(!session?.user || !selectedPlaylist) && (
            <div className="flex min-h-screen flex-col items-center p-8 pt-[24vh] text-white">
              <h1 className="mb-[72px] text-heading font-black">
                Generate your first playlist
              </h1>
              <PlaylistInput
                showSuggestions={true}
                onSubmit={handleGeneratePlaylist}
                isLoading={isLoading}
              />
            </div>
          )}

          {session?.user && selectedPlaylist && (
            <div className="relative mx-auto h-[100vh] max-w-[592px] py-24">
              <div className="relative flex h-full w-full flex-col gap-16">
                <div className="flex flex-shrink-0 items-center justify-between gap-16">
                  <PlaylistSelect
                    playlists={allPlaylists}
                    selectedPlaylist={selectedPlaylist}
                    onSelectPlaylist={setSelectedPlaylist}
                  />
                  <GenerateButton size="lg" />
                </div>

                <PlaylistView
                  playlist={selectedPlaylist}
                  onSelectPlaylist={setSelectedPlaylist}
                />

                <PlaylistInput
                  className="absolute bottom-0 left-0 right-0 z-10 px-12 pb-12"
                  onSubmit={handleGeneratePlaylist}
                  submitText="Update"
                  placeholderText="Describe what you want to update..."
                  isLoading={isLoading}
                  collapsable={true}
                  variant="gray"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
