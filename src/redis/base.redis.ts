import { Redis, RedisOptions } from "ioredis";
import { RedisHost, resolveRedisInstance } from "../helpers/resolve-redis-instance";
import { Cache, Expiry } from "../cache";

export interface RedisCacheOptions extends RedisOptions {
  defaultExpiry?: Expiry;
  enableExpensiveClear?: boolean;
}

export abstract class RedisCache extends Cache {
  protected readonly redis: Redis;
  protected readonly namespace: string;
  protected readonly enableClear?: boolean;

  constructor(host: RedisHost, namespace: string, options?: RedisCacheOptions) {
    super(undefined, options?.defaultExpiry);
    this.namespace = namespace;
    this.enableClear = options?.enableExpensiveClear;
    this.redis = resolveRedisInstance(host, options);
  }

  protected async clear(namespace?: string): Promise<void> {
    if (!this.enableClear)
      throw new Error(
        "Enable expensive clear option to clear redis caches. Please keep in mind, previously set key-value pairs will not be cleared."
      );

    const key = namespace ?? this.namespace;
    const members = await this.redis.smembers(key);
    await this.redis.del(members.concat(key));
    return;
  }
}
