import { Redis, RedisOptions } from "ioredis";
import { resolveRedisInstance } from "../../helpers";
import { Cache } from "./Cache";

export interface RedisCacheOptions extends RedisOptions {
  namespace?: string;
  defaultExpiry?: string;
}

export abstract class RedisCache extends Cache {
  protected readonly redis: Redis;

  constructor(host: string | RedisOptions | Redis, options?: RedisCacheOptions) {
    super(options?.namespace, options?.defaultExpiry);
    this.redis = resolveRedisInstance(host, options);
  }
}
