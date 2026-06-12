import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/env", () => ({
  envVariables: {
    AUTH_SECRET: "test-auth-secret",
  },
}));

import {
  createSignedOrgInviteCookieValue,
  parseSignedOrgInviteCookieValue,
} from "./orgInviteCookie";

describe("orgInviteCookie", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve assinar e validar payload com token e userId", () => {
    const signed = createSignedOrgInviteCookieValue({
      userId: "user-123",
      token: "invite-token-abc",
    });

    expect(parseSignedOrgInviteCookieValue(signed)).toEqual({
      userId: "user-123",
      token: "invite-token-abc",
    });
  });

  it("deve rejeitar assinatura adulterada", () => {
    const signed = createSignedOrgInviteCookieValue({
      userId: "user-123",
      token: "invite-token-abc",
    });

    const tampered = `${signed}x`;

    expect(parseSignedOrgInviteCookieValue(tampered)).toBeNull();
  });
});
