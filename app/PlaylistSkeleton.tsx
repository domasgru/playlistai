const shimmerAnimation = `
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
`;

export default function PlaylistSkeleton() {
  return (
    <>
      <style>{shimmerAnimation}</style>
      <div className="relative h-full min-w-0 flex-1 overflow-hidden overflow-y-auto rounded-xl border border-input bg-gray-800">
        <div className="relative z-[1] flex gap-14 p-28">
          <div className="relative h-[96px] w-[96px] flex-shrink-0 overflow-hidden rounded-[1px] bg-gray-700">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite_ease-in-out] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          <div className="mr-20 min-w-0 flex-grow pt-12">
            <div className="relative mb-12 h-32 w-[200px] overflow-hidden rounded-[8px] bg-gray-700">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite_ease-in-out] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
            <div className="relative h-20 w-[300px] overflow-hidden rounded-[6px] bg-gray-700">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite_ease-in-out] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </div>
        </div>

        <div className="relative z-[1] flex flex-col space-y-2 bg-[rgba(0,0,0,0.12)] pb-16 pt-16">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="flex items-center py-8 pl-32 pr-32">
              <div className="relative mr-24 h-22 w-22 overflow-hidden rounded-[6px] bg-gray-700">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite_ease-in-out] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
              <div className="relative mr-14 h-52 w-52 overflow-hidden rounded-[1px] bg-gray-700">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite_ease-in-out] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
              <div className="mr-40 flex-grow">
                <div className="relative mb-8 h-20 w-[200px] overflow-hidden rounded-[6px] bg-gray-700">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite_ease-in-out] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
                <div className="relative h-20 w-[150px] overflow-hidden rounded-[6px] bg-gray-700">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite_ease-in-out] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
              </div>
              <div className="relative h-20 w-[40px] overflow-hidden rounded-[6px] bg-gray-700">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite_ease-in-out] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
