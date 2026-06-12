import { AppContentSkeleton } from "./skeletons/AppContentSkeleton";

/** Fallback global enquanto a árvore de rotas inicial carrega. */
export function SkeletonLoading() {
  return (
    <div className="min-h-screen bg-background p-6">
      <AppContentSkeleton />
    </div>
  );
}
