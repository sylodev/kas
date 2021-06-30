import Redis from "ioredis";

export type RedisHost = string | Redis.RedisOptions | Redis.Redis;
export function resolveRedisInstance(host: RedisHost, options?: Redis.RedisOptions): Redis.Redis {
  if (host instanceof Redis || typeof Redis) return host as Redis.Redis;
  // host parameter being used as options object
  if (typeof host === "string") return new Redis(host, options);
  return new Redis(host);
}
