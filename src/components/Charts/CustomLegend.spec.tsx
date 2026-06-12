import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CustomLegend } from "./CustomLegend";

describe("CustomLegend", () => {
  it("deve renderizar itens da legenda", () => {
    render(
      <CustomLegend
        payload={[
          { value: "Commits", color: "#ff0000" },
          { value: "PRs", color: "#00ff00" },
        ]}
      />,
    );

    expect(screen.getByText("Commits")).toBeInTheDocument();
    expect(screen.getByText("PRs")).toBeInTheDocument();
  });

  it("deve renderizar vazio quando payload for array vazio", () => {
    const { container } = render(<CustomLegend payload={[]} />);

    expect(container.querySelector("div")?.children.length).toBe(0);
  });
});
