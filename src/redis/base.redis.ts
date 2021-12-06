import { Redis, RedisOptions } from "ioredis";
import { Cache, Expiry } from "../cache";
import { RedisLike, resolveRedisInstance } from "../helpers/resolve-redis-instance";

export interface RedisCacheOptions extends RedisOptions {
  /**
   * The default expiry used for "set()" calls that do not explicitly set one.
   */
  defaultExpiry?: Expiry;
  /**
   * Enable key tracking for this cache. This is required for the "clear()" and "keys()" methods.
   *
   * **This option can get computationally expensive** because it uses a separate set to keep track of the keys in this cache.
   * You should only enable this option on caches that require it and are relatively small, otherwise the overhead would
   * be too large for it to make sense.
   *
   * Keys added to the before this option was enabled cache will not be removed when
   * calling "clear()" or show up in the "keys()" result because they would not be recorded.
   * This also goes for other caches accessing the same namespace without this option enabled.
   */
  trackKeys?: boolean;
}

export abstract class RedisCache extends Cache {
  protected readonly redis: Redis;
  protected readonly namespace: string;
  protected readonly options?: RedisCacheOptions;

  constructor(host: RedisLike, namespace: string, options?: RedisCacheOptions) {
    super(undefined, options?.defaultExpiry);
    this.options = options;
    this.namespace = namespace;
    this.redis = resolveRedisInstance(host, options);
  }
}
