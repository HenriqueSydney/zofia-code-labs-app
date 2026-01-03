import { GoBackButton } from "@/components/GoBackButton";

interface PurchaseLayout {
  children: React.ReactNode;
}

export default async function PurchaseLayout({ children }: PurchaseLayout) {
  return (
    <div className="space-y-6 mb-10">
      {/* Header com Logo e Ações */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <GoBackButton />
        </div>
      </div>
      {children}
    </div>
  );
}
