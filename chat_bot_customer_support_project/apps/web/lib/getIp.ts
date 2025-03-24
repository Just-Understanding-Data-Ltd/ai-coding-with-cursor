import { headers } from "next/headers";

export const getIp = async () => {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";
  const headersInstance = await headers();
  const forwardedFor = headersInstance.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
  }

  return headersInstance.get("x-real-ip") ?? FALLBACK_IP_ADDRESS;
};
