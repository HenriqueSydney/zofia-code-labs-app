import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CustomTooltip } from "./CustomTooltip";

describe("CustomTooltip", () => {
  it("deve retornar null quando inativo", () => {
    const { container } = render(
      <CustomTooltip active={false} payload={[]} label="Jan" />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("deve renderizar label e valores quando ativo", () => {
    render(
      <CustomTooltip
        active
        label="2024-01"
        payload={[
          { value: 42, name: "Commits", color: "#6366f1" },
          { value: 7, name: "PRs", fill: "#22c55e" },
        ]}
      />,
    );

    expect(screen.getByText("2024-01")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Commits")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("PRs")).toBeInTheDocument();
  });
});
