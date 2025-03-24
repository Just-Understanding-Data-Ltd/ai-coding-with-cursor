import { kv } from "@vercel/kv";

export async function isRateLimited(
  userId: string,
  actionName: string,
  limit: number
) {
  const key = `rate_limit:${userId}:${actionName}`;
  const currentCount = (await kv.get(key)) as number | null;

  if (currentCount === null) {
    await kv.set(key, 1, { ex: 86400 }); // Set expiry for 24 hours
    return false;
  }

  if (currentCount >= limit) {
    return true;
  }

  await kv.incr(key);
  return false;
}
