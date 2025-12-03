export default function WishlistLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header Skeleton */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="h-8 bg-neutral-200 rounded w-56 mb-4 animate-pulse"></div>
          <div className="h-4 bg-neutral-200 rounded w-40 animate-pulse"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 animate-pulse"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-neutral-200" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-neutral-200 rounded w-1/2" />
                <div className="h-3 bg-neutral-200 rounded w-5/6" />
                <div className="h-6 bg-neutral-200 rounded w-24 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


