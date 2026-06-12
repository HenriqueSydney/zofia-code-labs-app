import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PasswordStrengthBar } from "./PasswordStrengthBar";

describe("PasswordStrengthBar", () => {
  it("deve exibir label Muito fraca para senha vazia", () => {
    render(<PasswordStrengthBar password="" />);

    expect(screen.getByText("Muito fraca")).toBeInTheDocument();
    expect(screen.getByText(/Força da senha:/)).toBeInTheDocument();
  });

  it("deve exibir label Fraca para senha com poucos critérios", () => {
    render(<PasswordStrengthBar password="azbycxqw" />);

    expect(screen.getByText("Fraca")).toBeInTheDocument();
  });

  it("deve exibir label Forte para senha com quatro critérios", () => {
    render(<PasswordStrengthBar password="Azbycxq1" />);

    expect(screen.getByText("Forte")).toBeInTheDocument();
  });

  it("deve exibir label Excelente para senha com todos os critérios", () => {
    render(<PasswordStrengthBar password="Azbycxq1!" />);

    expect(screen.getByText("Excelente")).toBeInTheDocument();
  });

  it("deve aplicar largura de 100% na barra para senha excelente", () => {
    const { container } = render(
      <PasswordStrengthBar password="Azbycxq1!" />,
    );

    const bar = container.querySelector(".h-full.transition-all");
    expect(bar).toHaveStyle({ width: "100%" });
  });

  it("deve aplicar largura de 20% na barra para senha muito fraca", () => {
    const { container } = render(<PasswordStrengthBar password="" />);

    const bar = container.querySelector(".h-full.transition-all");
    expect(bar).toHaveStyle({ width: "20%" });
  });

  it("deve aplicar classe de cor vermelha para senha muito fraca", () => {
    const { container } = render(<PasswordStrengthBar password="" />);

    const bar = container.querySelector(".h-full.transition-all");
    expect(bar).toHaveClass("bg-red-500");
  });

  it("deve aplicar classe de cor verde para senha forte", () => {
    const { container } = render(
      <PasswordStrengthBar password="Azbycxq1" />,
    );

    const bar = container.querySelector(".h-full.transition-all");
    expect(bar).toHaveClass("bg-green-500");
  });

  it("deve aplicar classe emerald para senha excelente", () => {
    const { container } = render(
      <PasswordStrengthBar password="Azbycxq1!" />,
    );

    const bar = container.querySelector(".h-full.transition-all");
    expect(bar).toHaveClass("bg-emerald-600");
  });
});
