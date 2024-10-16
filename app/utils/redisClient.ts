import Redis from "ioredis";

const { REDIS_HOST, REDIS_PORT } = process.env;

if (!REDIS_HOST || !REDIS_PORT) {
    console.error('Redis configuration error: REDIS_HOST and REDIS_PORT must be set');
    throw new Error('Missing Redis configuration');
}

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
});

redis.on('connect', () => {
    console.info('Redis client connected');
});

redis.on('ready', () => {
    console.info('Redis client ready');
});

redis.on('error', (error) => {
    console.error('Redis client error:', error);
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

export default redis;