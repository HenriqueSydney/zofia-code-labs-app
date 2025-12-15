import { describe, it, expect, beforeEach, vi } from "vitest";
import { prepareLogDataForLogger } from "./prepareLogDataForLogger";
import { ErrorLogData } from "@/app/api/errors/errorLoggerSchema";

describe("prepareLogDataForLogger", () => {
  const fakeUrl = "https://example.com/page";
  const fakeUserAgent = "FakeBrowser/1.0";
  const fakeSessionId = "abc123";

  beforeEach(() => {
    // Mock window.location
    delete (window as any).location;
    (window as any).location = { href: fakeUrl };

    // Mock navigator.userAgent
    Object.defineProperty(window.navigator, "userAgent", {
      value: fakeUserAgent,
      configurable: true,
    });

    const store: Record<string, string> = {};

    vi.spyOn(window.sessionStorage.__proto__, "getItem").mockImplementation(
      (key: any) => {
        return store[key] ?? null;
      }
    );

    vi.spyOn(window.sessionStorage.__proto__, "setItem").mockImplementation(
      (key: any, value: any) => {
        store[key] = value;
      }
    );
    window.sessionStorage.setItem("sessionId", fakeSessionId);
  });

  it("should return proper ErrorLogData with defaults", () => {
    const error = new Error("Test error") as Error & { digest?: string };
    error.digest = "digest123";

    const logData: ErrorLogData = prepareLogDataForLogger({ error });

    expect(logData.message).toBe("Test error");
    expect(logData.stack).toBe(error.stack);
    expect(logData.digest).toBe("digest123");
    expect(logData.url).toBe(fakeUrl);
    expect(logData.userAgent).toBe(fakeUserAgent);
    expect(logData.context).toBe("unknown");
    expect(logData.userId).toBeUndefined();
    expect(logData.sessionId).toBe(fakeSessionId);
    expect(logData.metadata).toEqual({ componentStack: undefined });
    expect(new Date(logData.timestamp).getTime()).toBeLessThanOrEqual(
      Date.now()
    );
  });

  it("should merge metadata and include componentStack", () => {
    const error = new Error("Another error") as Error & {
      digest?: string;
      componentStack?: string;
    };
    (error as any).componentStack = "Component > Stack";

    const metadata = { foo: "bar" };

    const logData = prepareLogDataForLogger({
      error,
      context: "testContext",
      userId: "user1",
      metadata,
    });

    expect(logData.context).toBe("testContext");
    expect(logData.userId).toBe("user1");
    expect(logData.metadata).toEqual({
      foo: "bar",
      componentStack: "Component > Stack",
    });
  });
});
