import Redis from "ioredis";

export type RedisLike = string | Redis.RedisOptions | Redis.Redis;
export function resolveRedisInstance(host: RedisLike, options?: Redis.RedisOptions): Redis.Redis {
  if (host instanceof Redis) return host as Redis.Redis;
  // host parameter being used as connection uri
  if (typeof host === "string") return new Redis(host, options);
  if (isRedisHostOptions(host)) return new Redis(host);
  throw new Error("Could not resolve redis connection instance.");
}

function isRedisHostOptions(input: unknown): input is Redis.RedisOptions {
  if (typeof input !== "object") throw new Error("Expected input to be an object.");
  if (input === null) throw new Error("Input cannot be null.");
  return "host" in input && "port" in input;
}
