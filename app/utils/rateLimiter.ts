import redis from "./redisClient";

export async function rateLimiter(
    key: string,
    maxRequests: number,
    windowInSeconds: number
): Promise<boolean> {
    try {
        if (redis.status !== 'ready') {
            console.error('Redis client is not connected or ready');
            return false;
        }

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