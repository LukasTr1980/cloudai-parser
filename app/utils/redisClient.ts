import Redis from "ioredis";

let redis: Redis | null = null;
let redisReadyPromise: Promise<Redis> | null = null;

export function getRedisClient(timeout = 5000): Promise<Redis> {
    if (redis) {
        if (redis.status === 'ready') {
            return Promise.resolve(redis);
        } else if (redisReadyPromise) {
            return redisReadyPromise;
        }
    }

    const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

    if (!REDIS_HOST || !REDIS_PORT) {
        console.error('Redis configuration error: REDIS_HOST and REDIS_PORT must be set');
        throw new Error('Missing Redis configuration');
    }

    redis = new Redis({
        host: REDIS_HOST,
        port: Number(REDIS_PORT),
        password: REDIS_PASSWORD,
    });

    redisReadyPromise = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            console.error('Redis client connection timeout');
            reject(new Error('Redis client connection timeout'));
        }, timeout);

        redis!.once('ready', () => {
            clearTimeout(timeoutId);
            console.info('Redis client ready');
            resolve(redis!);
        });
        redis!.once('error', (error) => {
            clearTimeout(timeoutId);
            console.error('Redis client error:', error);
            reject(error);
        });
    });

    redis.on('connect', () => {
        console.info('Redis client connected');
    });

    redis.on('close', () => {
        console.warn('Redis connection closed');
    });

    redis.on('reconnecting', () => {
        console.info('Redis client reconnecting');
    });

    redis.on('end', () => {
        console.warn('Redis connection ended');
    });

    return redisReadyPromise;
}