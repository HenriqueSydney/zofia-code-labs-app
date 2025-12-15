import React, { FC } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { useInfiniteScroll } from "./use-infinite-scroll";

// Mock IntersectionObserver
let mockObserverInstances: MockIntersectionObserver[] = [];

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  options: IntersectionObserverInit;
  elements: Element[] = [];

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    this.callback = callback;
    this.options = options || {};
    mockObserverInstances.push(this);
  }

  observe = vi.fn((element: Element) => {
    this.elements.push(element);
  });

  unobserve = vi.fn((element: Element) => {
    this.elements = this.elements.filter((el) => el !== element);
  });

  disconnect = vi.fn(() => {
    this.elements = [];
  });

  // Helper method to trigger intersection
  triggerIntersection(entries: Partial<IntersectionObserverEntry>[]) {
    const fullEntries = entries.map((entry) => ({
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRatio: entry.isIntersecting ? 1 : 0,
      intersectionRect: {} as DOMRectReadOnly,
      isIntersecting: false,
      rootBounds: {} as DOMRectReadOnly,
      target: entry.target as Element,
      time: Date.now(),
      ...entry,
    })) as IntersectionObserverEntry[];

    this.callback(fullEntries, this as any);
  }
}

beforeEach(() => {
  mockObserverInstances = [];
  (global as any).IntersectionObserver = MockIntersectionObserver;
});

afterEach(() => {
  vi.clearAllMocks();
  mockObserverInstances = [];
});

const TestComponent: FC<{
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}> = ({ hasMore, isLoading, onLoadMore }) => {
  const ref = useInfiniteScroll({ hasMore, isLoading, onLoadMore });
  return <div ref={ref} data-testid="sentinel" />;
};

describe("useInfiniteScroll", () => {
  it("should call onLoadMore when intersecting and hasMore is true", () => {
    const onLoadMore = vi.fn();
    const { getByTestId } = render(
      <TestComponent hasMore={true} isLoading={false} onLoadMore={onLoadMore} />
    );

    const sentinel = getByTestId("sentinel");
    const observerInstance = mockObserverInstances[0];

    // Trigger intersection
    observerInstance.triggerIntersection([
      { isIntersecting: true, target: sentinel },
    ]);

    expect(onLoadMore).toHaveBeenCalledTimes(1);
    expect(observerInstance.observe).toHaveBeenCalledWith(sentinel);
  });

  it("should NOT call onLoadMore when isLoading is true", () => {
    const onLoadMore = vi.fn();
    const { getByTestId } = render(
      <TestComponent hasMore={true} isLoading={true} onLoadMore={onLoadMore} />
    );

    const sentinel = getByTestId("sentinel");
    const observerInstance = mockObserverInstances[0];

    // Trigger intersection
    observerInstance.triggerIntersection([
      { isIntersecting: true, target: sentinel },
    ]);

    expect(onLoadMore).not.toHaveBeenCalled();
    expect(observerInstance.observe).toHaveBeenCalledWith(sentinel);
  });

  it("should NOT call onLoadMore when hasMore is false", () => {
    const onLoadMore = vi.fn();
    const { getByTestId } = render(
      <TestComponent
        hasMore={false}
        isLoading={false}
        onLoadMore={onLoadMore}
      />
    );

    const sentinel = getByTestId("sentinel");
    const observerInstance = mockObserverInstances[0];

    // Trigger intersection
    observerInstance.triggerIntersection([
      { isIntersecting: true, target: sentinel },
    ]);

    expect(onLoadMore).not.toHaveBeenCalled();
    expect(observerInstance.observe).toHaveBeenCalledWith(sentinel);
  });

  it("should NOT call onLoadMore when not intersecting", () => {
    const onLoadMore = vi.fn();
    const { getByTestId } = render(
      <TestComponent hasMore={true} isLoading={false} onLoadMore={onLoadMore} />
    );

    const sentinel = getByTestId("sentinel");
    const observerInstance = mockObserverInstances[0];

    // Trigger non-intersection
    observerInstance.triggerIntersection([
      { isIntersecting: false, target: sentinel },
    ]);

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("should disconnect observer on unmount", () => {
    const onLoadMore = vi.fn();
    const { unmount } = render(
      <TestComponent hasMore={true} isLoading={false} onLoadMore={onLoadMore} />
    );

    const observerInstance = mockObserverInstances[0];

    unmount();

    expect(observerInstance.disconnect).toHaveBeenCalled();
  });

  it("should create observer with custom options", () => {
    const TestComponentWithOptions: FC = () => {
      const ref = useInfiniteScroll({
        hasMore: true,
        isLoading: false,
        onLoadMore: vi.fn(),
        rootMargin: "50px",
        threshold: 0.5,
      });
      return <div ref={ref} data-testid="sentinel" />;
    };

    render(<TestComponentWithOptions />);

    const observerInstance = mockObserverInstances[0];
    expect(observerInstance.options).toEqual({
      rootMargin: "50px",
      threshold: 0.5,
    });
  });
});
