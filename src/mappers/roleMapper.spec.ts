import { describe, expect, it } from "vitest";
import { roleMapper } from "./roleMapper";

describe("roleMapper", () => {
  it("deve mapear todos os papéis de membro", () => {
    expect(roleMapper.TENANT_ADMIN).toBe("Administrador");
    expect(roleMapper.TENANT_MEMBER).toBe("Membro");
    expect(roleMapper.TENANT_OBSERVER).toBe("Usuário do cliente");
  });
});
