import redis from "./redisClient";

export async function rateLimiter(
    key: string,
    maxRequests: number,
    windowInSeconds: number
): Promise<boolean> {
    try {
        const requests = await redis.incr(key);
        if (requests === 1) {
            await redis.expire(key, windowInSeconds);
        }

        if (requests > maxRequests) {
            return false;
        }
        return true;
    } catch (error) {
        console.error('Redis error in rateLimiter:', error);
        return false;        
    }
}