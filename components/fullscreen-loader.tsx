import Loader from "@/components/loader";

export default function FullscreenLoader() {
  return (
    <div className="fixed inset-0 z-[1000] flex h-full w-full flex-col items-center justify-center bg-background-base p-32 text-white">
      <Loader />
    </div>
  );
}
