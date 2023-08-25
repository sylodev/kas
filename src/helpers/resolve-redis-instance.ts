import { type RedisOptions, type Redis } from "ioredis";
import { loadPackage } from "./load-package.js";

const REDIS_CLASS_NAMES = ["Redis", "RedisClient", "RedisCluster", "RedisSentinel", "RedisMock"];

export type RedisLike = string | RedisOptions | Redis;

function isObject(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null;
}

/**
 * Resolve a redis instance from a connection uri, options or an existing redis instance.
 * This uses fairly lax rules because typescript should prevent stupid people from being stupid.
 * @throws if the instance could not be resolved
 */
export function resolveRedisInstance(host: RedisLike, options?: RedisOptions): Redis {
  // "host" parameter being used as a connection uri
  const ioredis = loadPackage<typeof import("ioredis")>("ioredis", () => require("ioredis"));
  if (typeof host === "string") {
    if (options) return new ioredis.Redis(host, options);
    return new ioredis.Redis(host);
  }

  // "host" option appears to be an instanceof "Redis" or a related class
  // this is a flaky test as some transpilers will change the class name, or they could have an unrelated class called "Redis",
  // this will cover "RedisMock" support, some circular dependency issues and other edge cases, basically "Redis" instances that
  // arent *technically* instances of Redis but are still usable redis instances.
  if (REDIS_CLASS_NAMES.some((name) => host.constructor.name.includes(name))) {
    return host as Redis;
  }

  // "host" option is an instance of Redis - this covers for classes that extend Redis
  // or that have been renamed by a transpiler to something other than "Redis"
  if (host instanceof ioredis.Redis) {
    return host as Redis;
  }

  // "host" parameter being used as a RedisOptions object
  // this is very lax but it should be fine™️ for almost everything else.
  if (isObject(host)) {
    return new ioredis.Redis(host);
  }

  throw new Error("Could not resolve redis connection instance.");
}
