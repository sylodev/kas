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
  protected readonly options?: RedisCacheOptions;

  constructor(host: RedisHost, namespace: string, options?: RedisCacheOptions) {
    super(undefined, options?.defaultExpiry);
    this.options = options;
    this.namespace = namespace;
    // todo: not great
    delete options?.defaultExpiry;
    delete options?.enableExpensiveClear;
    this.redis = resolveRedisInstance(host, options);
  }

  protected async clear(namespace?: string): Promise<void> {
    const key = namespace ?? this.namespace;
    const members = await this.redis.smembers(key);
    await this.redis.del(members.concat(key));
    return;
  }
}
