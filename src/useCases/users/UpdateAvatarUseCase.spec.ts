import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import type { IS3StorageService } from "../../services/s3Client/IS3StorageService";
import { UpdateAvatarUseCase } from "./UpdateAvatarUseCase";

let usersRepository: InMemoryUsersRepository;
let storageService: IS3StorageService;
let sut: UpdateAvatarUseCase;

describe("UpdateAvatarUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usersRepository = new InMemoryUsersRepository();
    storageService = {
      getInstance: vi.fn(),
      getFileBuffer: vi.fn(),
      upload: vi.fn().mockResolvedValue({ key: "avatars/user/new.png" }),
      getSignedUrl: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    };
    sut = new UpdateAvatarUseCase(usersRepository, storageService);
  });

  it("deve fazer upload e atualizar avatar do usuário", async () => {
    const user = await usersRepository.create({
      organizationId: randomUUID(),
      name: "Usuário Teste",
      email: "usuario@test.com",
      passwordHash: "hash",
    });

    const file = {
      name: "avatar.png",
      type: "image/png",
      arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer),
    } as unknown as File;

    const result = await sut.execute({ userId: user.id, file });

    expect(result.image).toBe("avatars/user/new.png");
    expect(storageService.upload).toHaveBeenCalled();
    expect(usersRepository.items[0].image).toBe("avatars/user/new.png");
  });
});
