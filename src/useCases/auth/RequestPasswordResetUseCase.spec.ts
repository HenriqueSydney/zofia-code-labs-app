import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendForgotPasswordEmail } from "@/email/send/sendForgotPasswordEmail";
import { InMemoryUsersRepository } from "@/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryVerificationTokenRepository } from "@/repositories/in-memory/InMemoryVerificationTokenRepository";

import { RequestPasswordResetUseCase } from "./RequestPasswordResetUseCase";

vi.mock("@/email/send/sendForgotPasswordEmail", () => ({
  sendForgotPasswordEmail: vi.fn(),
}));

let usersRepository: InMemoryUsersRepository;
let verificationTokenRepository: InMemoryVerificationTokenRepository;
let sut: RequestPasswordResetUseCase;

describe("RequestPasswordResetUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usersRepository = new InMemoryUsersRepository();
    verificationTokenRepository = new InMemoryVerificationTokenRepository();
    sut = new RequestPasswordResetUseCase(
      usersRepository,
      verificationTokenRepository,
    );
  });

  it("deve enviar e-mail e criar token quando usuário existe", async () => {
    await usersRepository.create({
      organizationId: randomUUID(),
      name: "Henrique Lima",
      email: "henrique@zofiacodelabs.com",
      passwordHash: "hash",
    });

    await sut.execute({ email: "henrique@zofiacodelabs.com" });

    expect(verificationTokenRepository.items).toHaveLength(1);
    expect(verificationTokenRepository.items[0].identifier).toBe(
      "password-reset:henrique@zofiacodelabs.com",
    );
    expect(sendForgotPasswordEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "henrique@zofiacodelabs.com",
        userName: "Henrique Lima",
        userEmail: "henrique@zofiacodelabs.com",
        resetLink: expect.stringContaining("/auth/reset-password?token="),
      }),
    );
  });

  it("deve concluir sem enviar e-mail quando usuário não existe", async () => {
    await sut.execute({ email: "inexistente@zofiacodelabs.com" });

    expect(verificationTokenRepository.items).toHaveLength(0);
    expect(sendForgotPasswordEmail).not.toHaveBeenCalled();
  });

  it("deve substituir token anterior para o mesmo e-mail", async () => {
    await usersRepository.create({
      organizationId: randomUUID(),
      name: "Usuário Teste",
      email: "usuario@test.com",
      passwordHash: "hash",
    });

    await sut.execute({ email: "usuario@test.com" });
    const firstToken = verificationTokenRepository.items[0].token;

    await sut.execute({ email: "usuario@test.com" });

    expect(verificationTokenRepository.items).toHaveLength(1);
    expect(verificationTokenRepository.items[0].token).not.toBe(firstToken);
  });
});
