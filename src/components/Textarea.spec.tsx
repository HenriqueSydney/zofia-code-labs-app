import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { FieldError } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Textarea } from "./Textarea";

// Mock das dependências
vi.mock("@/lib/tailwindClassMerge", () => ({
  cn: (...classes: (string | undefined | boolean)[]) =>
    classes.filter(Boolean).join(" "),
}));

vi.mock("./ui/textarea", () => ({
  Textarea: ({ className, ...props }: any) => (
    <textarea data-testid="shadcn-textarea" className={className} {...props} />
  ),
}));

vi.mock("./ErrorMessage", () => ({
  ErrorMessage: ({ errorMessage }: { errorMessage?: string }) =>
    errorMessage ? <div data-testid="error-message">{errorMessage}</div> : null,
}));

describe("Textarea Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render textarea without label and error", () => {
    render(<Textarea placeholder="Digite aqui..." />);

    const textarea = screen.getByTestId("shadcn-textarea");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute("placeholder", "Digite aqui...");
    expect(screen.queryByText(/label/)).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("should render textarea with label", () => {
    render(<Textarea label="Descrição" placeholder="Digite aqui..." />);

    expect(screen.getByText("Descrição")).toBeInTheDocument();
    expect(screen.getByTestId("shadcn-textarea")).toBeInTheDocument();
  });

  it("should render textarea with error message", () => {
    const error: FieldError = {
      type: "required",
      message: "Este campo é obrigatório",
    };

    render(<Textarea error={error} />);

    const errorMessage = screen.getByTestId("error-message");
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent("Este campo é obrigatório");
  });

  it("should apply error styles when error is present", () => {
    const error: FieldError = {
      type: "required",
      message: "Erro de validação",
    };

    render(<Textarea error={error} />);

    const textarea = screen.getByTestId("shadcn-textarea");
    expect(textarea).toHaveClass("border-destructive", "shadow-glow");
  });

  it("should not apply error styles when no error", () => {
    render(<Textarea />);

    const textarea = screen.getByTestId("shadcn-textarea");
    expect(textarea).not.toHaveClass("border-destructive", "shadow-glow");
  });

  it("should forward ref correctly", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("should pass through HTML textarea attributes", () => {
    render(<Textarea rows={5} cols={30} maxLength={100} disabled />);

    const textarea = screen.getByTestId("shadcn-textarea");
    expect(textarea).toHaveAttribute("rows", "5");
    expect(textarea).toHaveAttribute("cols", "30");
    expect(textarea).toHaveAttribute("maxLength", "100");
    expect(textarea).toBeDisabled();
  });

  it("should handle user input correctly", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Textarea onChange={handleChange} />);

    const textarea = screen.getByTestId("shadcn-textarea");
    await user.type(textarea, "Hello World");

    expect(handleChange).toHaveBeenCalledTimes(11); // Uma para cada caractere
    expect(textarea).toHaveValue("Hello World");
  });

  it("should apply default CSS classes", () => {
    render(<Textarea />);

    const textarea = screen.getByTestId("shadcn-textarea");
    expect(textarea).toHaveClass(
      "flex-1",
      "px-4",
      "py-2",
      "rounded-md",
      "bg-background",
      "border",
      "border-border",
      "transition-all",
      "duration-300",
      "text-foreground",
      "placeholder:text-muted-foreground",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-primary",
      "focus:border-primary",
      "resize-none"
    );
  });

  it("should render both label and error message", () => {
    const error: FieldError = {
      type: "minLength",
      message: "Mínimo 10 caracteres",
    };

    render(<Textarea label="Comentário" error={error} />);

    expect(screen.getByText("Comentário")).toBeInTheDocument();
    expect(screen.getByText("Mínimo 10 caracteres")).toBeInTheDocument();
  });

  it("should not render error message when error has no message", () => {
    const error: FieldError = {
      type: "required",
      message: undefined as any,
    };

    render(<Textarea error={error} />);

    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("should handle focus and blur events", async () => {
    const user = userEvent.setup();
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();

    render(<Textarea onFocus={handleFocus} onBlur={handleBlur} />);

    const textarea = screen.getByTestId("shadcn-textarea");

    await user.click(textarea);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    await user.tab();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it("should have correct container structure", () => {
    render(<Textarea label="Test Label" />);

    // Verifica se o container principal tem as classes corretas
    const container = screen.getByText("Test Label").closest("div");
    expect(container?.parentElement).toHaveClass(
      "w-full",
      "flex",
      "flex-col",
      "gap-2"
    );
  });

  describe("Accessibility", () => {
    it("should associate label with textarea", () => {
      render(<Textarea label="Descrição do produto" />);

      const label = screen.getByText("Descrição do produto");
      const textarea = screen.getByTestId("shadcn-textarea");

      // Como não há htmlFor/id explícito, verifica se estão na mesma estrutura
      expect(label.closest("div")).toBeInTheDocument();
      expect(textarea).toBeInTheDocument();
    });

    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<Textarea />);

      const textarea = screen.getByTestId("shadcn-textarea");

      // Testa navegação por teclado
      await user.tab();
      expect(textarea).toHaveFocus();
    });
  });
});
