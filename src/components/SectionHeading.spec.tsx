import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionHeading } from "./SectionHeading";

describe("SectionHeading", () => {
  it("deve renderizar título", () => {
    render(<SectionHeading title="Clientes" />);

    expect(screen.getByRole("heading", { name: "Clientes" })).toBeInTheDocument();
  });

  it("deve renderizar description e subDescription quando informados", () => {
    render(
      <SectionHeading
        title="Projetos"
        description="Lista de projetos ativos"
        subDescription="slug: zofia-erp"
      />,
    );

    expect(screen.getByText("Lista de projetos ativos")).toBeInTheDocument();
    expect(screen.getByText("slug: zofia-erp")).toBeInTheDocument();
  });

  it("deve renderizar badge opcional", () => {
    render(
      <SectionHeading
        title="Financeiro"
        badge={<span data-testid="badge">Novo</span>}
      />,
    );

    expect(screen.getByTestId("badge")).toBeInTheDocument();
  });
});
