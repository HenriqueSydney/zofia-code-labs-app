import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendPasswordChangedEmail } from "@/email/send/sendPasswordChangedEmail";
import { BusinessRuleError } from "../../errors/BusinessRuleError";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { ValidationError } from "../../errors/ValidationError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { UpdatePasswordUseCase } from "./UpdatePasswordUseCase";

vi.mock("@/email/send/sendPasswordChangedEmail", () => ({
  sendPasswordChangedEmail: vi.fn(),
}));

let usersRepository: InMemoryUsersRepository;
let sut: UpdatePasswordUseCase;

describe("UpdatePasswordUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usersRepository = new InMemoryUsersRepository();
    sut = new UpdatePasswordUseCase(usersRepository);
  });

  it("deve atualizar senha quando senha atual está correta", async () => {
    const currentPassword = "senha-atual";
    const newPassword = "nova-senha";
    const passwordHash = await hash(currentPassword, 6);

    const user = await usersRepository.create({
      organizationId: randomUUID(),
      name: "Usuário Teste",
      email: "usuario@test.com",
      passwordHash,
    });

    await sut.execute({
      userId: user.id,
      currentPassword,
      newPassword,
      ipAddress: "201.192.120.44",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0",
    });

    expect(usersRepository.items[0].passwordHash).not.toBe(passwordHash);
    expect(sendPasswordChangedEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "usuario@test.com",
        userName: "Usuário Teste",
        userEmail: "usuario@test.com",
        ipAddress: "201.192.120.44",
        deviceInfo: "Windows • Chrome",
        resetLink: expect.stringContaining("/auth/remember-me"),
      }),
    );
  });

  it("deve lançar ResourceNotFoundError quando usuário não existe", async () => {
    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        currentPassword: "atual",
        newPassword: "nova",
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve lançar ValidationError quando usuário não possui senha", async () => {
    const user = await usersRepository.create({
      organizationId: randomUUID(),
      name: "Usuário Social",
      email: "social@test.com",
      passwordHash: null,
    });

    await expect(() =>
      sut.execute({
        userId: user.id,
        currentPassword: "atual",
        newPassword: "nova",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("deve lançar BusinessRuleError quando senha atual está incorreta", async () => {
    const passwordHash = await hash("senha-correta", 6);

    const user = await usersRepository.create({
      organizationId: randomUUID(),
      name: "Usuário Teste",
      email: "usuario@test.com",
      passwordHash,
    });

    await expect(() =>
      sut.execute({
        userId: user.id,
        currentPassword: "senha-errada",
        newPassword: "nova-senha",
      }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });
});
