import { Expiry } from "../cache";
import { RedisLike } from "../helpers/resolve-redis-instance";
import { MapCache } from "../interfaces/map-cache.interface";
import { SetOption } from "../types";
import { RedisCache, RedisCacheOptions } from "./base.redis";

export class RedisMapCache<Type> extends RedisCache implements MapCache<Type> {
  private readonly trackKeys?: boolean;

  constructor(host: RedisLike, namespace: string, options?: RedisCacheOptions | Expiry) {
    super(host, namespace, RedisMapCache.resolveOptions(options));
    this.trackKeys = this.options?.trackKeys;
  }

  /**
   * Get the key for the members set, used to track which keys are in this cache.
   * @throws if key tracking is not enabled
   */
  protected get membersSetKey() {
    if (!this.trackKeys) {
      throw new Error('The "trackKeys" option is required to use this method.');
    }

    // the additional prefix here is important so we dont accidentally obliterate
    // an unrelated key. if the namespace was "balls" and someone created a key
    // called "balls" with an unrelated value, clearing the cache would wipe their key.
    return `kas:members:${this.namespace}`;
  }

  /**
   * Get a keys value from the cache.
   */
  public async get(key: string): Promise<Type | undefined> {
    const prefixedKey = this.getPrefixedKey(key);
    const stringified = await this.redis.get(prefixedKey);
    if (stringified === null) return;
    return JSON.parse(stringified);
  }

  /**
   * Add an item to the cache.
   */
  public async set(key: string, data: Type, ttl?: Expiry, mode?: SetOption): Promise<boolean> {
    if (data == null) return false;
    const prefixedKey = this.getPrefixedKey(key);
    const stringified = JSON.stringify(data);
    const params: [string, string, ...any] = [prefixedKey, stringified];
    const expiresIn = this.getRelativeExpiry(ttl);
    if (expiresIn !== undefined) {
      // PX = millisecond precision
      // https://redis.io/commands/set#options
      params.push("PX", expiresIn);
    }

    if (mode) params.push(mode);
    if (this.trackKeys) {
      await this.redis
        .pipeline()
        .sadd(this.membersSetKey, key)
        .set(...params)
        .exec();
    } else {
      await this.redis.set(...params);
    }

    return true;
  }

  /**
   * Delete a key from the cache.
   */
  public async delete(key: string): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);
    if (this.trackKeys) {
      await this.redis.pipeline().srem(this.membersSetKey, key).del(prefixedKey).exec();
    } else {
      await this.redis.del(prefixedKey);
    }

    return true;
  }

  /**
   * Check if the cache has a key.
   */
  public async has(key: string): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);
    const exists = await this.redis.exists(prefixedKey);
    return exists === 1 ? true : false;
  }

  /**
   * Clear all options in the cache.
   * @throws if the "trackKeys" option is not enabled.
   */
  public async clear(): Promise<void> {
    const members = await this.redis.smembers(this.membersSetKey);
    const keys = members.map((key) => this.getPrefixedKey(key)).concat(this.membersSetKey);
    await this.redis.del(...keys);
  }

  /**
   * Gets all keys in the cache.
   * @throws if the "trackKeys" option is not enabled.
   */
  public async keys(): Promise<string[]> {
    return this.redis.smembers(this.membersSetKey);
  }

  protected static resolveOptions(options?: RedisCacheOptions | Expiry) {
    if (typeof options === "string" || typeof options === "number") return { defaultExpiry: options };
    return options;
  }
}
