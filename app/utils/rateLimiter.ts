import { getRedisClient } from "./redisClient";

export async function rateLimiter(
    namespace: string,
    ip: string,
    maxRequests: number,
    windowInSeconds: number
): Promise<boolean> {
    try {
        const redis = await getRedisClient();

        const key = `cloudai_rate_limit:${namespace}:${ip}`;

        const requests = await redis.incr(key);
        if (requests === 1) {
            await redis.expire(key, windowInSeconds);
        }

        return requests <= maxRequests;
    } catch (error) {
        console.error('Redis error in rateLimiter:', error);
        return false;
    }
}