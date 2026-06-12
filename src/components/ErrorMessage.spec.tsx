import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ErrorMessage } from "./ErrorMessage";

describe("ErrorMessage", () => {
  it("deve não renderizar nada quando errorMessage é null", () => {
    const { container } = render(<ErrorMessage errorMessage={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("deve não renderizar nada quando errorMessage é undefined", () => {
    const { container } = render(<ErrorMessage />);

    expect(container).toBeEmptyDOMElement();
  });

  it("deve não renderizar nada quando errorMessage é string vazia", () => {
    const { container } = render(<ErrorMessage errorMessage="" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("deve exibir a mensagem de erro quando errorMessage é fornecida", () => {
    render(<ErrorMessage errorMessage="Campo obrigatório" />);

    expect(screen.getByText("Campo obrigatório")).toBeInTheDocument();
  });

  it("deve renderizar o ícone de alerta junto à mensagem", () => {
    const { container } = render(
      <ErrorMessage errorMessage="Erro de validação" />,
    );

    expect(screen.getByText("Erro de validação")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
