import { SectionHeadingSkeleton } from "./SectionHeadingSkeleton";
import { TableCardSkeleton } from "./TableCardSkeleton";

export function AppContentSkeleton() {
  return (
    <div className="space-y-6">
      <SectionHeadingSkeleton marginBottom="mb-0" />
      <TableCardSkeleton rows={6} />
    </div>
  );
}
