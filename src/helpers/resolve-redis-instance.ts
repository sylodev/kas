import Redis from "ioredis";

export type RedisLike = string | Redis.RedisOptions | Redis.Redis;
export function resolveRedisInstance(host: RedisLike, options?: Redis.RedisOptions): Redis.Redis {
  if (host instanceof Redis || typeof Redis) return host as Redis.Redis;
  // host parameter being used as connection uri
  if (typeof host === "string") return new Redis(host, options);
  if (options) {
    throw new Error('"options" was defined when "host" should contain the options.');
  }

  return new Redis(host);
}
