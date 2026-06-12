import { render, screen } from "@testing-library/react";
import { Activity } from "lucide-react";
import { describe, expect, it } from "vitest";
import { StatsCard } from "./StatsCard";

describe("StatsCard", () => {
  it("deve renderizar label e mainInformation", () => {
    render(
      <StatsCard
        label="Projetos ativos"
        mainInformation={42}
        Icon={Activity}
      />,
    );

    expect(screen.getByText("Projetos ativos")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("deve exibir trend positivo com percentual absoluto", () => {
    render(
      <StatsCard
        label="Cobertura"
        mainInformation="85%"
        Icon={Activity}
        trend={12}
        reverseColor={false}
      />,
    );

    expect(screen.getByText("12%")).toBeInTheDocument();
  });

  it("deve aplicar cor verde quando trend positivo e reverseColor é false", () => {
    const { container } = render(
      <StatsCard
        label="Cobertura"
        mainInformation="85%"
        Icon={Activity}
        trend={12}
        reverseColor={false}
      />,
    );

    const trendElement = container.querySelector(".text-green-600");
    expect(trendElement).toBeInTheDocument();
  });

  it("deve aplicar cor destrutiva quando trend positivo e reverseColor é true", () => {
    const { container } = render(
      <StatsCard
        label="Bugs"
        mainInformation={5}
        Icon={Activity}
        trend={8}
        reverseColor={true}
      />,
    );

    const trendElement = container.querySelector(".text-destructive");
    expect(trendElement).toBeInTheDocument();
  });

  it("deve exibir stableTrendLabel quando trend é zero", () => {
    render(
      <StatsCard
        label="Receita"
        mainInformation="R$ 10.000"
        Icon={Activity}
        trend={0}
        stableTrendLabel="Estável"
      />,
    );

    expect(screen.getByText("Estável")).toBeInTheDocument();
  });

  it("deve aplicar cor neutra quando trend é zero", () => {
    const { container } = render(
      <StatsCard
        label="Receita"
        mainInformation="R$ 10.000"
        Icon={Activity}
        trend={0}
        stableTrendLabel="Estável"
      />,
    );

    const trendElement = container.querySelector(".text-muted-foreground");
    expect(trendElement).toBeInTheDocument();
  });

  it("deve renderizar description quando fornecida", () => {
    render(
      <StatsCard
        label="Vendas"
        mainInformation={100}
        Icon={Activity}
        trend={5}
        description="vs. mês anterior"
      />,
    );

    expect(screen.getByText("vs. mês anterior")).toBeInTheDocument();
  });

  it("deve renderizar badge quando fornecido", () => {
    render(
      <StatsCard
        label="Tickets"
        mainInformation={3}
        Icon={Activity}
        badge={<span>Novo</span>}
      />,
    );

    expect(screen.getByText("Novo")).toBeInTheDocument();
  });

  it("deve não exibir informação de trend quando trend é undefined", () => {
    render(
      <StatsCard
        label="Total"
        mainInformation={10}
        Icon={Activity}
      />,
    );

    expect(screen.queryByText("%")).not.toBeInTheDocument();
  });
});
