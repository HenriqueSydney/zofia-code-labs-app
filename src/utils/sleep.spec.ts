import { describe, expect, it, vi } from "vitest";
import { sleep } from "./sleep";

describe("sleep", () => {
  it("deve resolver após o tempo informado", async () => {
    vi.useFakeTimers();

    const promise = sleep(500);
    vi.advanceTimersByTime(500);

    await expect(promise).resolves.toBeUndefined();

    vi.useRealTimers();
  });
});
