import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkeletonLoading } from "./Loading";

describe("SkeletonLoading", () => {
  it("deve renderizar o fallback da aplicação", () => {
    const { container } = render(<SkeletonLoading />);

    expect(container.querySelector(".min-h-screen")).toBeTruthy();
    expect(container.querySelectorAll("[data-slot='skeleton']").length).toBeGreaterThan(0);
  });
});
