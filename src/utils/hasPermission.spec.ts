import { describe, expect, it } from "vitest";
import { PERMISSIONS } from "../constants/permissions";
import { ValidationError } from "../errors";
import { Role } from "../generated/prisma/enums";
import {
  assertPermission,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "./hasPermission";

const permission = PERMISSIONS.PROJECT.READ;

describe("hasPermission", () => {
  it("deve retornar false quando subject for nulo", () => {
    expect(hasPermission(null, permission)).toBe(false);
  });

  it("deve retornar true quando permissão estiver no array", () => {
    const subject = { role: Role.USER, permissions: [permission] };

    expect(hasPermission(subject, permission)).toBe(true);
  });

  it("deve tratar subject sem array de permissions como lista vazia", () => {
    const subject = { role: Role.USER };

    expect(hasPermission(subject, permission)).toBe(false);
  });

  it("deve validar role quando requiredRole for OWNER", () => {
    const owner = { role: Role.OWNER, permissions: [] };
    const user = { role: Role.USER, permissions: [permission] };

    expect(
      hasPermission(owner, permission, { requiredRole: Role.OWNER }),
    ).toBe(true);
    expect(
      hasPermission(user, permission, { requiredRole: Role.OWNER }),
    ).toBe(false);
  });
});

describe("hasAnyPermission", () => {
  it("deve retornar true se pelo menos uma permissão existir", () => {
    const subject = { role: Role.USER, permissions: [permission] };

    expect(
      hasAnyPermission(subject, [PERMISSIONS.PROJECT.CREATE, permission]),
    ).toBe(true);
  });
});

describe("hasAllPermissions", () => {
  it("deve retornar false se faltar alguma permissão", () => {
    const subject = { role: Role.USER, permissions: [permission] };

    expect(
      hasAllPermissions(subject, [permission, PERMISSIONS.PROJECT.CREATE]),
    ).toBe(false);
  });
});

describe("assertPermission", () => {
  it("deve lançar ValidationError quando não tiver permissão", () => {
    expect(() => assertPermission(null, permission)).toThrow(ValidationError);
  });

  it("deve não lançar quando permissão for válida", () => {
    const subject = { role: Role.USER, permissions: [permission] };

    expect(() => assertPermission(subject, permission)).not.toThrow();
  });
});
