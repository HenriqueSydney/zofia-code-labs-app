import { describe, expect, it } from "vitest";
import {
  clientEmployeeRoleKeys,
  getClientEmployeeRoleLabel,
} from "./clientEmployeeRoleMapper";

describe("clientEmployeeRoleMapper", () => {
  const t = (key: string) => `role:${key}`;

  it("deve retornar chave i18n correta para cada papel", () => {
    expect(clientEmployeeRoleKeys.ADMIN).toBe("ADMIN");
    expect(clientEmployeeRoleKeys.USER).toBe("USER");
    expect(clientEmployeeRoleKeys.VIEWER).toBe("VIEWER");
  });

  it("deve traduzir label do papel via função t", () => {
    expect(getClientEmployeeRoleLabel("ADMIN", t)).toBe("role:ADMIN");
    expect(getClientEmployeeRoleLabel("VIEWER", t)).toBe("role:VIEWER");
  });
});
