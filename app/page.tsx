import PlaylistInput from "@/components/PlaylistInput";
import { SessionProvider } from "next-auth/react";

export default function Home() {
  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col items-center p-8 pt-[24vh] text-white">
        <h1 className="mb-[72px] text-heading font-black">
          Generate your first playlist
        </h1>

        <PlaylistInput />
      </div>
    </SessionProvider>
  );
}
