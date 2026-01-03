"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ContractWithDetails } from "@/repositories/IContractRepository";
import { ContractHistoryList } from "./ContractHistoryList";
import { EmptyState } from "./EmptyState";
import { FileText, Loader2 } from "lucide-react";

interface IContractList {
  contracts: ContractWithDetails[];
  totalOfRegister: number;
}

export function ContractList({ contracts, totalOfRegister }: IContractList) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado para acumular todos os contratos carregados
  const [accumulatedContracts, setAccumulatedContracts] =
    useState<ContractWithDetails[]>(contracts);
  const observerTarget = useRef<HTMLDivElement>(null);

  const currentPage = Number(searchParams.get("page")) || 1;
  const ITEMS_PER_PAGE = 10;
  const hasMore = accumulatedContracts.length < totalOfRegister;

  // Sincroniza os contratos que vêm do servidor (SSR/Server Action) com o estado local
  useEffect(() => {
    if (currentPage === 1) {
      setAccumulatedContracts(contracts);
    } else {
      setAccumulatedContracts((prev) => {
        // Evita duplicatas caso o useEffect dispare duas vezes em Strict Mode
        const newContracts = contracts.filter(
          (newContract) =>
            !prev.some((prevContract) => prevContract.id === newContract.id)
        );
        return [...prev, ...newContracts];
      });
    }
  }, [contracts, currentPage]);

  const loadMore = () => {
    if (!hasMore) return;

    const nextPage = currentPage + 1;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", nextPage.toString());
    params.set("numberPerPage", ITEMS_PER_PAGE.toString());

    // scroll: false evita que a página pule para o topo ao carregar mais
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, searchParams]); // Monitora searchParams para reagir à mudança de página

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        {accumulatedContracts.map((contract) => (
          <ContractHistoryList key={contract.id} contract={contract} />
        ))}
      </div>

      {totalOfRegister === 0 && (
        <EmptyState
          title="Nenhum contrato localizado"
          icon={FileText}
          description="Nenhum contrato cadastrado até o momento. Siga o fluxo do projeto para criar um a partir de um template ou anexe o contrato para encaminhamento para assinatura"
        />
      )}

      {/* Alvo do Observer */}
      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Carregando mais contratos...</span>
          </div>
        </div>
      )}

      {!hasMore && totalOfRegister > 0 && (
        <div className="text-center text-sm text-muted-foreground py-8 border-t border-dashed mt-4">
          Você chegou ao fim da lista. Total de {totalOfRegister} contratos.
        </div>
      )}
    </div>
  );
}
