import { makeLoginHistoryRepository } from "@/repositories/factories/makeLoginHistoryRepository";
import { IpApiGeolocationService } from "@/services/geolocation/IpApiGeolocationService";
import { RecordLoginHistoryUseCase } from "../RecordLoginHistoryUseCase";

let recordLoginHistoryUseCase: RecordLoginHistoryUseCase;

export function makeRecordLoginHistoryUseCase() {
  if (!recordLoginHistoryUseCase) {
    recordLoginHistoryUseCase = new RecordLoginHistoryUseCase(
      makeLoginHistoryRepository(),
      new IpApiGeolocationService(),
    );
  }

  return recordLoginHistoryUseCase;
}
