import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { UnauthorizedError } from "../../errors/UnauthorizedError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import type { IS3StorageService } from "../../services/s3Client/IS3StorageService";
import { GetUserAllInfoUseCase } from "./GetUserAllInfoUseCase";

let usersRepository: InMemoryUsersRepository;
let storageService: IS3StorageService;
let sut: GetUserAllInfoUseCase;

describe("GetUserAllInfoUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usersRepository = new InMemoryUsersRepository();
    storageService = {
      getInstance: vi.fn(),
      getFileBuffer: vi.fn(),
      upload: vi.fn(),
      getSignedUrl: vi.fn().mockResolvedValue("https://signed-url.example/avatar"),
      delete: vi.fn(),
      list: vi.fn(),
    };
    sut = new GetUserAllInfoUseCase(usersRepository, storageService);
  });

  it("deve retornar informações completas do usuário autenticado", async () => {
    const user = await usersRepository.create({
      organizationId: randomUUID(),
      name: "Usuário Teste",
      email: "usuario@test.com",
      passwordHash: "hash",
      image: "avatars/user/photo.png",
    });

    const result = await sut.execute({
      targetUserId: user.id,
      authenticatedUserId: user.id,
    });

    expect(result.user.id).toBe(user.id);
    expect(result.user.image).toBe("https://signed-url.example/avatar");
    expect(storageService.getSignedUrl).toHaveBeenCalledWith(
      "avatars/user/photo.png",
      3600,
    );
  });

  it("deve manter URL externa de avatar sem assinar", async () => {
    const user = await usersRepository.create({
      organizationId: randomUUID(),
      name: "Usuário Google",
      email: "google@test.com",
      passwordHash: "hash",
      image: "https://lh3.googleusercontent.com/avatar.png",
    });

    const result = await sut.execute({
      targetUserId: user.id,
      authenticatedUserId: user.id,
    });

    expect(result.user.image).toBe("https://lh3.googleusercontent.com/avatar.png");
    expect(storageService.getSignedUrl).not.toHaveBeenCalled();
  });

  it("deve anular avatar quando assinatura de URL falhar", async () => {
    vi.mocked(storageService.getSignedUrl).mockRejectedValueOnce(
      new Error("storage down"),
    );

    const user = await usersRepository.create({
      organizationId: randomUUID(),
      name: "Usuário Teste",
      email: "fail@test.com",
      passwordHash: "hash",
      image: "avatars/user/broken.png",
    });

    const result = await sut.execute({
      targetUserId: user.id,
      authenticatedUserId: user.id,
    });

    expect(result.user.image).toBeNull();
  });

  it("deve retornar usuário sem processar imagem quando avatar não existe", async () => {
    const user = await usersRepository.create({
      organizationId: randomUUID(),
      name: "Usuário Sem Avatar",
      email: "sem-avatar@test.com",
      passwordHash: "hash",
      image: null,
    });

    const result = await sut.execute({
      targetUserId: user.id,
      authenticatedUserId: user.id,
    });

    expect(result.user).toMatchObject({
      id: user.id,
      name: "Usuário Sem Avatar",
      email: "sem-avatar@test.com",
      image: null,
    });
    expect(storageService.getSignedUrl).not.toHaveBeenCalled();
  });

  it("deve lançar UnauthorizedError quando usuário tenta acessar dados de outro", async () => {
    await expect(() =>
      sut.execute({
        targetUserId: randomUUID(),
        authenticatedUserId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("deve lançar ResourceNotFoundError quando usuário não existe", async () => {
    const userId = randomUUID();

    await expect(() =>
      sut.execute({
        targetUserId: userId,
        authenticatedUserId: userId,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
