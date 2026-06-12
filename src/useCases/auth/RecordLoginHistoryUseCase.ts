import { sendNewLoginAlert } from "@/email/send/sendNewLoginAlert";
import { isLocalhostIp } from "@/lib/auth/extractClientIp";
import { date } from "@/lib/dayjs";
import { ILoginHistoryRepository } from "@/repositories/ILoginHistoryRepository";
import { IGeolocationService } from "@/services/geolocation/IGeolocationService";
import { formatLoginLocation } from "@/utils/formatLoginLocation";
import { parseUserAgent } from "@/utils/parseUserAgent";

interface RecordLoginHistoryUseCaseRequest {
  userId: string;
  userEmail: string | null | undefined;
  userName: string | null | undefined;
  ipAddress: string;
  userAgent: string | null;
}

export class RecordLoginHistoryUseCase {
  constructor(
    private loginHistoryRepository: ILoginHistoryRepository,
    private geolocationService: IGeolocationService,
  ) {}

  async execute({
    userId,
    userEmail,
    userName,
    ipAddress,
    userAgent,
  }: RecordLoginHistoryUseCaseRequest): Promise<void> {
    const normalizedUserAgent = userAgent ?? "unknown";
    const deviceInfo = parseUserAgent(normalizedUserAgent).name;

    const { city, country, region } =
      await this.geolocationService.resolveByIp(ipAddress);

    const shouldNotify = await this.loginHistoryRepository.shouldNotifyUnknownLogin(
      userId,
      ipAddress,
      normalizedUserAgent,
    );

    await this.loginHistoryRepository.create({
      userId,
      ipAddress,
      userAgent: normalizedUserAgent,
      device: deviceInfo,
      city,
      country,
      region,
    });

    if (!shouldNotify || !userEmail || isLocalhostIp(ipAddress)) {
      return;
    }

    const baseUrl = (
      process.env.BASE_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000"
    ).replace(/\/$/, "");

    const loginTime = date().format("DD [de] MMMM, HH:mm");

    await sendNewLoginAlert({
      to: userEmail,
      userName: userName ?? userEmail,
      userEmail,
      loginTime,
      ipAddress,
      location: formatLoginLocation(city, region, country),
      deviceInfo,
      secureAccountLink: `${baseUrl}/user/${userId}`,
    });
  }
}
