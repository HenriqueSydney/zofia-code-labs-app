import { Skeleton } from "./ui/skeleton";

export const SkeletonLoading = () => {
  return (
    <>
      {/* Hero Skeleton */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

        <div className="container mx-auto px-4 py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Skeleton className="h-10 w-48 mx-auto rounded-full" />
            <Skeleton className="h-20 w-full max-w-3xl mx-auto" />
            <Skeleton className="h-12 w-full max-w-2xl mx-auto" />
            <Skeleton className="h-6 w-full max-w-xl mx-auto" />
            <Skeleton className="h-14 w-48 mx-auto rounded-full mt-8" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Skeleton */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto">
          <Skeleton className="h-12 w-96 mx-auto mb-16" />

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-effect p-8 rounded-lg">
                <Skeleton className="h-14 w-14 rounded-2xl mb-6" />
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Skeleton */}
      <section className="py-24 px-4 bg-muted/50">
        <div className="container mx-auto">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto mb-12" />

          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-10 w-32" />
              ))}
            </div>

            <div className="glass-effect p-8 rounded-lg min-h-[400px]">
              <Skeleton className="h-8 w-64 mb-6" />
              <Skeleton className="h-48 w-full mb-4" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Skeleton */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto">
          <Skeleton className="h-12 w-80 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto mb-12" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-effect p-6 rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full mb-4 mx-auto" />
                <Skeleton className="h-6 w-32 mb-3 mx-auto" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audit Skeleton */}
      <section className="py-24 px-4 bg-muted/50">
        <div className="container mx-auto">
          <Skeleton className="h-12 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto mb-12" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-effect p-6 rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-6 w-32 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </section>

      {/* Google Ads Skeleton */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-effect p-8 rounded-lg">
            <Skeleton className="h-8 w-64 mb-4 mx-auto" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>
        </div>
      </section>
    </>
  );
};
