import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GoBackButton } from "./GoBackButton";
// Mocks
vi.mock("lucide-react", () => ({
  ArrowLeft: ({ className }: { className?: string }) => (
    <div data-testid="arrow-left-icon" className={className} />
  ),
}));

vi.mock("./ui/button", () => ({
  Button: ({ children, variant, size, className }: any) => (
    <div
      data-testid="button-wrapper"
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </div>
  ),
}));

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => `translated-${key}`),
}));

describe("GoBackButton", () => {
  const mockHistoryBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "history", {
      value: { back: mockHistoryBack },
      writable: true,
    });
  });

  it("should render with correct translation and icon", () => {
    render(<GoBackButton />);

    expect(screen.getByText("translated-goBackButton")).toBeInTheDocument();
    expect(screen.getByTestId("arrow-left-icon")).toBeInTheDocument();
  });

  it("should call window.history.back() when clicked", () => {
    render(<GoBackButton />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockHistoryBack).toHaveBeenCalledTimes(1);
  });

  it("should apply correct props to Button wrapper and icon classes", () => {
    render(<GoBackButton />);

    const buttonWrapper = screen.getByTestId("button-wrapper");
    expect(buttonWrapper).toHaveAttribute("data-variant", "outline");
    expect(buttonWrapper).toHaveAttribute("data-size", "lg");
    expect(buttonWrapper).toHaveClass("group");

    const icon = screen.getByTestId("arrow-left-icon");
    expect(icon).toHaveClass(
      "w-4",
      "h-4",
      "mr-2",
      "group-hover:-translate-x-1",
      "transition-transform"
    );
  });
});
