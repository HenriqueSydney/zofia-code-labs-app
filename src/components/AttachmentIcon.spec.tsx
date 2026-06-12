import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AttachmentIcon } from "./AttachmentIcon";

describe("AttachmentIcon", () => {
  it("deve renderizar ícone vermelho para extensão pdf", () => {
    const { container } = render(<AttachmentIcon extension="pdf" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("text-red-500");
  });

  it("deve renderizar ícone verde para extensão xlsx", () => {
    const { container } = render(<AttachmentIcon extension="xlsx" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("text-green-600");
  });

  it("deve renderizar ícone verde para extensão csv", () => {
    const { container } = render(<AttachmentIcon extension="csv" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("text-green-600");
  });

  it("deve renderizar ícone azul para extensão docx", () => {
    const { container } = render(<AttachmentIcon extension="docx" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("text-blue-500");
  });

  it("deve renderizar ícone roxo para extensão png", () => {
    const { container } = render(<AttachmentIcon extension="png" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("text-purple-500");
  });

  it("deve renderizar ícone padrão para extensão desconhecida", () => {
    const { container } = render(<AttachmentIcon extension="zip" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("text-muted-foreground");
  });

  it("deve tratar extensão de forma case-insensitive", () => {
    const { container } = render(<AttachmentIcon extension="PDF" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("text-red-500");
  });

  it("deve renderizar ícone padrão quando extension é null", () => {
    const { container } = render(<AttachmentIcon extension={null} />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("text-muted-foreground");
  });
});
