import Redis from "ioredis";

export function resolveRedisInstance(hostOrOptions: string | Redis.RedisOptions | Redis.Redis, options?: Redis.RedisOptions): Redis.Redis {
  if (hostOrOptions instanceof Redis) return hostOrOptions;
  if (typeof hostOrOptions === "string") return new Redis(hostOrOptions, options);
  return new Redis(hostOrOptions);
}
