import { describe, expect, it } from "vitest";
import {
  ClientEmployeeRoleMapper,
} from "./clientEmployeeMappers";

describe("clientEmployeeMappers", () => {
  it("deve mapear papéis de colaborador do cliente", () => {
    expect(ClientEmployeeRoleMapper.ADMIN).toBe("Administrador");
    expect(ClientEmployeeRoleMapper.USER).toBe("Usuário (Padrão)");
    expect(ClientEmployeeRoleMapper.VIEWER).toBe("Visualizador");
  });
});
