import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { handleActionError } from "./handleActionError";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("handleActionError", () => {
  const setError = vi.fn();
  const messages = {
    checkFormFields: "Verifique os campos",
    processRequest: "Erro ao processar",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("não deve fazer nada quando erro for nulo", () => {
    handleActionError(null, setError, messages);

    expect(toast.error).not.toHaveBeenCalled();
    expect(setError).not.toHaveBeenCalled();
  });

  it("deve exibir toast quando erro for string", () => {
    handleActionError("E-mail inválido", setError, messages);

    expect(toast.error).toHaveBeenCalledWith("E-mail inválido");
    expect(setError).not.toHaveBeenCalled();
  });

  it("deve setar erro de campo e exibir toast de formulário", () => {
    handleActionError({ email: ["E-mail obrigatório"] }, setError, messages);

    expect(setError).toHaveBeenCalledWith("email", {
      type: "manual",
      message: "E-mail obrigatório",
    });
    expect(toast.error).toHaveBeenCalledWith("Verifique os campos");
  });

  it("deve exibir toast genérico quando objeto não tiver mensagens de campo", () => {
    handleActionError({ email: [] }, setError, messages);

    expect(setError).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Erro ao processar");
  });
});
