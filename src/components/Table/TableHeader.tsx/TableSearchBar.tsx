"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ITableSearchBar {
  isHeaderSearchBarOpen: boolean;
  handleToggleSearchBar: () => void;
  tableId?: string;
}

export function TableSearchBar({
  isHeaderSearchBarOpen,
  handleToggleSearchBar,
  tableId = "",
}: ITableSearchBar) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    handleSearchInput(event.target.value);
  }

  const handleSearchInput = useDebouncedCallback((query: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (query.length < 3) {
      params.delete("query");
    } else {
      params.set("query", query);
    }

    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, 300);

  const handleCloseSearchBar = useCallback(() => {
    if (isHeaderSearchBarOpen) {
      const params = new URLSearchParams(searchParams);
      if (params.has("query")) {
        params.delete("query");
        handleSearchInput("");
        replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }
    handleToggleSearchBar();
  }, [
    isHeaderSearchBarOpen,
    searchParams,
    pathname,
    replace,
    handleToggleSearchBar,
  ]);

  const handleEscPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseSearchBar();
      }
    },
    [handleCloseSearchBar]
  );

  useEffect(() => {
    if (isHeaderSearchBarOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isHeaderSearchBarOpen]);

  useEffect(() => {
    if (isHeaderSearchBarOpen) {
      document.addEventListener("keydown", handleEscPress);

      return () => {
        document.removeEventListener("keydown", handleEscPress);
      };
    }
  }, [isHeaderSearchBarOpen, handleEscPress]);

  return (
    <div
      className={`flex items-center gap-2 transition-all duration-300 ${
        isHeaderSearchBarOpen
          ? "opacity-100 w-full min-w-100"
          : "opacity-0 max-w-0 w-0 overflow-hidden"
      }`}
    >
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          id={`table-searchbox-${tableId}`}
          type="search"
          placeholder="Buscar na tabela"
          aria-label="Buscar na tabela"
          defaultValue={searchParams.get("query")?.toString() ?? ""}
          onChange={handleChange}
          className="pr-10 focus-visible:ring-1 focus-visible:ring-offset-0"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full hover:bg-transparent"
          aria-label="Buscar"
        >
          <Search size={16} aria-hidden="true" />
        </Button>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full shrink-0"
        aria-label="Fechar busca"
        onClick={handleCloseSearchBar}
      >
        <X size={16} />
      </Button>
    </div>
  );
}
