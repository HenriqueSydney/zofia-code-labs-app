import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendNewLoginAlert } from "@/email/send/sendNewLoginAlert";
import { InMemoryLoginHistoryRepository } from "@/repositories/in-memory/InMemoryLoginHistoryRepository";
import {
  GeolocationResult,
  IGeolocationService,
} from "@/services/geolocation/IGeolocationService";

import { RecordLoginHistoryUseCase } from "./RecordLoginHistoryUseCase";

vi.mock("@/email/send/sendNewLoginAlert", () => ({
  sendNewLoginAlert: vi.fn(),
}));

class StubGeolocationService implements IGeolocationService {
  async resolveByIp(): Promise<GeolocationResult> {
    return {
      city: "Brasília",
      country: "Brasil",
      region: "Distrito Federal",
    };
  }
}

let loginHistoryRepository: InMemoryLoginHistoryRepository;
let geolocationService: StubGeolocationService;
let sut: RecordLoginHistoryUseCase;

const userId = randomUUID();
const defaultRequest = {
  userId,
  userEmail: "usuario@test.com",
  userName: "Usuário Teste",
  ipAddress: "201.192.120.44",
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0",
};

describe("RecordLoginHistoryUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loginHistoryRepository = new InMemoryLoginHistoryRepository();
    geolocationService = new StubGeolocationService();
    sut = new RecordLoginHistoryUseCase(
      loginHistoryRepository,
      geolocationService,
    );
  });

  it("deve registrar histórico sem enviar e-mail no primeiro login", async () => {
    await sut.execute(defaultRequest);

    expect(loginHistoryRepository.items).toHaveLength(1);
    expect(loginHistoryRepository.items[0].device).toBe("Windows • Chrome");
    expect(sendNewLoginAlert).not.toHaveBeenCalled();
  });

  it("deve registrar histórico sem enviar e-mail para dispositivo conhecido", async () => {
    await loginHistoryRepository.create({
      userId,
      ipAddress: defaultRequest.ipAddress,
      userAgent: defaultRequest.userAgent,
      device: "Windows • Chrome",
      city: "Brasília",
      country: "Brasil",
      region: "Distrito Federal",
    });

    await sut.execute(defaultRequest);

    expect(loginHistoryRepository.items).toHaveLength(2);
    expect(sendNewLoginAlert).not.toHaveBeenCalled();
  });

  it("deve enviar alerta quando dispositivo é desconhecido", async () => {
    await loginHistoryRepository.create({
      userId,
      ipAddress: "10.0.0.1",
      userAgent: "Mozilla/5.0 (Macintosh) Safari/17.0",
      device: "MacOS • Safari",
      city: "São Paulo",
      country: "Brasil",
      region: "São Paulo",
    });

    await sut.execute(defaultRequest);

    expect(loginHistoryRepository.items).toHaveLength(2);
    expect(sendNewLoginAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "usuario@test.com",
        userName: "Usuário Teste",
        userEmail: "usuario@test.com",
        ipAddress: "201.192.120.44",
        deviceInfo: "Windows • Chrome",
        location: "Brasília, Distrito Federal, Brasil",
        secureAccountLink: expect.stringContaining(`/user/${userId}`),
      }),
    );
  });

  it("não deve enviar alerta em localhost", async () => {
    await loginHistoryRepository.create({
      userId,
      ipAddress: "10.0.0.2",
      userAgent: "Mozilla/5.0 (Macintosh) Safari/17.0",
      device: "MacOS • Safari",
      city: null,
      country: null,
      region: null,
    });

    await sut.execute({
      ...defaultRequest,
      ipAddress: "127.0.0.1",
    });

    expect(loginHistoryRepository.items).toHaveLength(2);
    expect(sendNewLoginAlert).not.toHaveBeenCalled();
  });
});
