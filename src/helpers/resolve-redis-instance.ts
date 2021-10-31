import Redis from "ioredis";

export type RedisHost = string | Redis.RedisOptions | Redis.Redis;
export function resolveRedisInstance(host: RedisHost, options?: Redis.RedisOptions): Redis.Redis {
  if (host instanceof Redis || typeof Redis) return host as Redis.Redis;
  // host parameter being used as connection uri
  if (typeof host === "string") return new Redis(host, options);
  if (isRedisOptions(host)) return new Redis(host);
  throw new Error("Could not resolve redis connection instance.");
}

function isRedisOptions(input: unknown): input is Redis.RedisOptions {
  if (typeof input !== "object") throw new Error("Expected input to be an object.");
  if (input === null) throw new Error("Input cannot be null.");
  return "host" in input && "port" in input;
}
