"use client";

interface SkeletonLoaderProps {
  type: "hero" | "about" | "blogs" | "gallery" | "events" | "newsletter";
}

export default function SkeletonLoader({ type }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case "hero":
        return (
          <div className="relative w-screen left-1/2 right-1/2 -translate-x-1/2 overflow-hidden bg-neutral-900">
            <div className="h-[82vh] w-full flex items-center">
              <div className="absolute inset-0 bg-gray-800 animate-pulse" />
              <div className="container relative z-20 mx-auto px-6 md:px-12">
                <div className="max-w-3xl space-y-4">
                  <div className="h-12 md:h-16 bg-gray-700 rounded animate-pulse w-3/4" />
                  <div className="h-6 md:h-8 bg-gray-700 rounded animate-pulse w-full" />
                  <div className="h-6 md:h-8 bg-gray-700 rounded animate-pulse w-5/6" />
                  <div className="flex gap-4 mt-8">
                    <div className="h-12 w-32 bg-gray-700 rounded-full animate-pulse" />
                    <div className="h-12 w-32 bg-gray-700 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "about":
        return (
          <section className="pt-8 md:pt-20">
            <div className="container mx-auto px-6">
              <div className="-mt-16 sm:-mt-36 relative z-10 px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-200 rounded-xl p-6 animate-pulse">
                      <div className="h-8 w-8 bg-gray-300 rounded mb-4" />
                      <div className="h-6 bg-gray-300 rounded mb-2 w-3/4" />
                      <div className="h-4 bg-gray-300 rounded w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );

      case "blogs":
        return (
          <section className="py-16">
            <div className="container mx-auto px-6">
              <div className="h-12 bg-gray-200 rounded w-1/3 mb-8 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "gallery":
        return (
          <section className="py-16">
            <div className="container mx-auto px-6">
              <div className="h-12 bg-gray-200 rounded w-1/3 mb-8 animate-pulse" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </section>
        );

      case "events":
        return (
          <section className="py-16">
            <div className="container mx-auto px-6">
              <div className="h-12 bg-gray-200 rounded w-1/3 mb-8 animate-pulse" />
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="h-16 w-16 bg-gray-200 rounded-lg" />
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-5/6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "newsletter":
        return (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-6">
              <div className="max-w-2xl mx-auto text-center space-y-4 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto" />
                <div className="flex gap-4 max-w-md mx-auto mt-8">
                  <div className="flex-1 h-12 bg-gray-200 rounded" />
                  <div className="h-12 w-32 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />;
    }
  };

  return <>{renderSkeleton()}</>;
}
