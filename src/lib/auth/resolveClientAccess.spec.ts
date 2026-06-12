import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemberRole } from "@/generated/prisma/enums";
import {
  assertClientAccessForUser,
  canObserverAccessClientSlug,
} from "./resolveClientAccess";

vi.mock("./assertClientEmployeePermission", () => ({
  assertClientSlugAccess: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

import { assertClientSlugAccess } from "./assertClientEmployeePermission";
import { checkUserPermissionForAsset } from "./checkUserPermissionForAsset";

describe("canObserverAccessClientSlug", () => {
  it("deve permitir quando usuário não é TENANT_OBSERVER", () => {
    expect(
      canObserverAccessClientSlug(
        { memberRole: MemberRole.TENANT_ADMIN, clientMembershipSlugs: [] },
        "empresa",
      ),
    ).toBe(true);
  });

  it("deve negar observer sem slug na lista de memberships", () => {
    expect(
      canObserverAccessClientSlug(
        {
          memberRole: MemberRole.TENANT_OBSERVER,
          clientMembershipSlugs: ["outra-empresa"],
        },
        "empresa",
      ),
    ).toBe(false);
  });

  it("deve permitir observer com slug na lista de memberships", () => {
    expect(
      canObserverAccessClientSlug(
        {
          memberRole: MemberRole.TENANT_OBSERVER,
          clientMembershipSlugs: ["empresa"],
        },
        "empresa",
      ),
    ).toBe(true);
  });
});

describe("assertClientAccessForUser", () => {
  const client = { organizationId: "org-1" };
  const userId = "user-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve usar assertClientSlugAccess para TENANT_OBSERVER", async () => {
    await assertClientAccessForUser({
      userId,
      memberRole: MemberRole.TENANT_OBSERVER,
      clientSlug: "empresa",
      client,
      operation: "READ",
    });

    expect(assertClientSlugAccess).toHaveBeenCalledWith(userId, "empresa");
    expect(checkUserPermissionForAsset).not.toHaveBeenCalled();
  });

  it("deve usar checkUserPermissionForAsset para membros internos", async () => {
    await assertClientAccessForUser({
      userId,
      memberRole: MemberRole.TENANT_MEMBER,
      clientSlug: "empresa",
      client,
      operation: "READ",
    });

    expect(assertClientSlugAccess).not.toHaveBeenCalled();
    expect(checkUserPermissionForAsset).toHaveBeenCalledWith(
      "client",
      userId,
      client,
      "READ",
    );
  });

  it("deve respeitar assetType clientEmployee", async () => {
    await assertClientAccessForUser({
      userId,
      memberRole: MemberRole.TENANT_ADMIN,
      clientSlug: "empresa",
      client,
      operation: "READ",
      assetType: "clientEmployee",
    });

    expect(checkUserPermissionForAsset).toHaveBeenCalledWith(
      "clientEmployee",
      userId,
      client,
      "READ",
    );
  });
});
