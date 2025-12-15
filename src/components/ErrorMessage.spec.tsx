import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ErrorMessage } from "./ErrorMessage";

// Mock do lucide-react
vi.mock("lucide-react", () => ({
  TriangleAlertIcon: ({ className }: { className?: string }) => (
    <div data-testid="triangle-alert-icon" className={className} />
  ),
}));

describe("ErrorMessage", () => {
  it("should render error message with icon when errorMessage is provided", () => {
    render(<ErrorMessage errorMessage="Something went wrong" />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByTestId("triangle-alert-icon")).toBeInTheDocument();

    const container = screen.getByText("Something went wrong").closest("div");
    expect(container).toHaveClass(
      "flex",
      "gap-2",
      "text-sm",
      "items-center",
      "text-destructive"
    );
  });

  it("should not render anything when errorMessage is null or undefined", () => {
    const { container: nullContainer } = render(
      <ErrorMessage errorMessage={null} />
    );
    expect(nullContainer).toBeEmptyDOMElement();

    const { container: undefinedContainer } = render(<ErrorMessage />);
    expect(undefinedContainer).toBeEmptyDOMElement();
  });

  it("should apply correct classes to icon and handle empty string", () => {
    render(<ErrorMessage errorMessage="Error text" />);

    const icon = screen.getByTestId("triangle-alert-icon");
    expect(icon).toHaveClass("w-5", "h-5");

    // Test empty string (should not render)
    const { container } = render(<ErrorMessage errorMessage="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
