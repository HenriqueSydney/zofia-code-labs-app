import { describe, expect, it } from "vitest";

import { sanitizeCallbackUrl } from "./sanitizeCallbackUrl";

describe("sanitizeCallbackUrl", () => {
  it("deve remover token da query string", () => {
    expect(
      sanitizeCallbackUrl(
        "/auth/invite/accept",
        "?token=secret-token&changePassword=1",
      ),
    ).toBe("/auth/invite/accept?changePassword=1");
  });

  it("deve manter pathname quando só havia token", () => {
    expect(
      sanitizeCallbackUrl("/auth/invite/accept", "?token=secret-token"),
    ).toBe("/auth/invite/accept");
  });
});
