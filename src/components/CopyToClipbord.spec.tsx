import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CopyToClipboard } from "./CopyToClipbord";

// Mocks
vi.mock("lucide-react", () => ({
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  Copy: () => <div data-testid="copy-icon" />,
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("./Tooltip", () => ({
  Tooltip: ({ children, description, className }: any) => (
    <div data-testid="tooltip" title={description} className={className}>
      {children}
    </div>
  ),
}));

const mockClipboard = {
  writeText: vi.fn(() => Promise.resolve()),
};

Object.assign(navigator, {
  clipboard: mockClipboard,
});

describe("CopyToClipboard", () => {
  const defaultProps = {
    id: "test-id",
    content: "Test content to copy",
    description: "Copy this content",
    showDescription: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with copy icon and description when showDescription is true", () => {
    render(<CopyToClipboard {...defaultProps} showDescription={true} />);

    expect(screen.getByTestId("copy-icon")).toBeInTheDocument();
    expect(screen.getByText("Copy this content")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toHaveAttribute(
      "title",
      "Copy this content"
    );
  });

  it("should copy provided content to clipboard when content prop exists", async () => {
    const { toast } = await import("@/hooks/use-toast");

    render(<CopyToClipboard {...defaultProps} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      "Test content to copy"
    );
    expect(toast).toHaveBeenCalledWith({
      title: "Conteúdo copiado com sucesso",
      action: expect.any(Object),
    });
  });

  it("should copy element text when no content prop provided", async () => {
    const { toast } = await import("@/hooks/use-toast");

    // Criar elemento DOM mockado
    const mockElement = {
      innerText: "  Element text content  ",
    };
    vi.spyOn(document, "getElementById").mockReturnValue(mockElement as any);

    render(<CopyToClipboard {...defaultProps} content="" />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(document.getElementById).toHaveBeenCalledWith(
      "copy_content_test-id"
    );
    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      "Element text content"
    );
    expect(toast).toHaveBeenCalled();
  });

  it("should not show description text when showDescription is false", () => {
    render(<CopyToClipboard {...defaultProps} showDescription={false} />);

    expect(screen.queryByText("Copy this content")).not.toBeInTheDocument();
    expect(screen.getByTestId("copy-icon")).toBeInTheDocument();
  });
});
