import { isLocalhostIp } from "@/lib/auth/extractClientIp";
import {
  GeolocationResult,
  IGeolocationService,
} from "./IGeolocationService";

type IpApiResponse = {
  status?: string;
  city?: string;
  country?: string;
  regionName?: string;
};

export class IpApiGeolocationService implements IGeolocationService {
  async resolveByIp(ipAddress: string): Promise<GeolocationResult> {
    if (isLocalhostIp(ipAddress)) {
      return {
        city: "Localhost",
        country: "Localhost",
        region: "Localhost",
      };
    }

    try {
      const response = await fetch(
        `http://ip-api.com/json/${ipAddress}?fields=city,country,regionName,status`,
      );
      const data = (await response.json()) as IpApiResponse;

      if (data.status !== "success") {
        return { city: null, country: null, region: null };
      }

      return {
        city: data.city ?? null,
        country: data.country ?? null,
        region: data.regionName ?? null,
      };
    } catch {
      return { city: null, country: null, region: null };
    }
  }
}
