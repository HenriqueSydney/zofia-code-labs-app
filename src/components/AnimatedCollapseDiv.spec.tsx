import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AnimatedCollapseDiv } from "./AnimatedCollapseDiv";

// Mock do framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div
        data-testid="motion-div"
        className={className}
        data-initial={JSON.stringify(props.initial)}
        data-animate={JSON.stringify(props.animate)}
        data-exit={JSON.stringify(props.exit)}
        data-transition={JSON.stringify(props.transition)}
        {...props}
      >
        {children}
      </div>
    ),
  },
}));

describe("AnimatedCollapseDiv", () => {
  it("should render children correctly", () => {
    render(
      <AnimatedCollapseDiv>
        <p>Test content</p>
        <span>Another element</span>
      </AnimatedCollapseDiv>
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
    expect(screen.getByText("Another element")).toBeInTheDocument();
  });

  it("should apply correct CSS classes and animation props", () => {
    render(
      <AnimatedCollapseDiv>
        <div>Content</div>
      </AnimatedCollapseDiv>
    );

    const motionDiv = screen.getByTestId("motion-div");

    expect(motionDiv).toHaveClass("overflow-hidden");
    expect(motionDiv).toHaveAttribute(
      "data-initial",
      '{"height":0,"opacity":0}'
    );
    expect(motionDiv).toHaveAttribute(
      "data-animate",
      '{"height":"auto","opacity":1}'
    );
    expect(motionDiv).toHaveAttribute("data-exit", '{"height":0,"opacity":0}');
    expect(motionDiv).toHaveAttribute(
      "data-transition",
      '{"duration":0.4,"ease":"easeInOut"}'
    );
  });

  it("should handle empty children", () => {
    render(<AnimatedCollapseDiv>{null}</AnimatedCollapseDiv>);

    const motionDiv = screen.getByTestId("motion-div");
    expect(motionDiv).toBeInTheDocument();
    expect(motionDiv).toBeEmptyDOMElement();
  });
});
