import { ValidationError } from "@/errors";
import { render, screen } from "@testing-library/react";
import { Inbox } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "./EmptyState";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

describe("EmptyState", () => {
  it("deve renderizar título e descrição quando ícone é fornecido", () => {
    render(
      <EmptyState
        title="Nenhum item encontrado"
        description="Tente ajustar os filtros."
        icon={Inbox}
      />,
    );

    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Nenhum item encontrado",
    );
    expect(screen.getByText("Tente ajustar os filtros.")).toBeInTheDocument();
  });

  it("deve renderizar ícone quando icon é fornecido", () => {
    const { container } = render(
      <EmptyState title="Lista vazia" icon={Inbox} />,
    );

    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("deve renderizar imagem quando image é fornecida", () => {
    render(
      <EmptyState
        title="Sem resultados"
        image="/empty-state.png"
      />,
    );

    const image = screen.getByRole("img", { name: "Sem resultados" });
    expect(image).toHaveAttribute("src", "/empty-state.png");
  });

  it("deve renderizar action quando fornecida", () => {
    render(
      <EmptyState
        title="Sem dados"
        icon={Inbox}
        action={<button type="button">Criar novo</button>}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Criar novo" }),
    ).toBeInTheDocument();
  });

  it("deve aplicar className customizada ao container", () => {
    const { container } = render(
      <EmptyState
        title="Vazio"
        icon={Inbox}
        className="custom-empty-state"
      />,
    );

    expect(container.firstChild).toHaveClass("custom-empty-state");
  });

  it("deve lançar ValidationError quando nem image nem icon são fornecidos", () => {
    expect(() => render(<EmptyState title="Inválido" />)).toThrow(
      ValidationError,
    );
    expect(() => render(<EmptyState title="Inválido" />)).toThrow(
      "Provide an image or icon for EmptyState",
    );
  });
});
