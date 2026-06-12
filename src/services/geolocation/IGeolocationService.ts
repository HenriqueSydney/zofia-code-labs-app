export type GeolocationResult = {
  city: string | null;
  country: string | null;
  region: string | null;
};

export interface IGeolocationService {
  resolveByIp(ipAddress: string): Promise<GeolocationResult>;
}
