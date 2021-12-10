import { Expiry } from "../cache";
import { parseRedisBoolean } from "../helpers/parse-redis-boolean";
import { RedisLike } from "../helpers/resolve-redis-instance";
import { AsyncMapCache } from "../interfaces/map-cache.interface";
import { SetOption } from "../types";
import { RedisCache, RedisCacheOptions } from "./base.redis";

export class RedisMapCache<Type> extends RedisCache implements AsyncMapCache<Type> {
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
   * Get multiple keys at once.
   * @returns a list of values matching the same indexes as the keys for that value.
   */
  async getMany(keys: string[]): Promise<Type[]> {
    if (!keys[0]) return [];
    const prefixedKeys = keys.map((key) => this.getPrefixedKey(key));
    const values = await this.redis.mget(...prefixedKeys);
    return values.map((value) => (value === null ? value : JSON.parse(value)));
  }

  /**
   * Add an item to the cache.
   */
  public async set(key: string, data: Type, ttl?: Expiry, mode?: SetOption): Promise<boolean> {
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
      // depending on the redis config, auto pipelining may be enabled so using a pipeline here
      // might be redundant but if it isnt this will be a minor performance boost.
      await this.redis
        .pipeline()
        // using the unprefixed key is intentional, it allows keys() to return the keys
        // without having to remove the prefix. clear() and methods that require the prefixed
        // key can add it themselves, those lazy bastards.
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
    return parseRedisBoolean(exists);
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
   * Gets the keys of every item in the cache.
   * The keys are not guaranteed to exist in the cache, though it should be fairly accurate.
   * @throws if the "trackKeys" option is not enabled.
   */
  public async keys(): Promise<string[]> {
    return this.redis.smembers(this.membersSetKey);
  }

  /**
   * Get every value in the cache.
   * @throws if the "trackKeys" option is not enabled.
   */
  public async values(): Promise<Type[]> {
    const keys = await this.keys();
    const values = await this.getMany(keys);
    return values.filter((value) => value !== null) as Type[];
  }

  /**
   * Get every key with its value in the cache.
   * @throws if the "trackKeys" option is not enabled.
   */
  public async *entries(): AsyncGenerator<[string, Type]> {
    const keys = await this.keys();
    const values = await this.getMany(keys);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = values[i];
      if (value !== null) {
        yield [key, value];
      }
    }
  }

  protected static resolveOptions(options?: RedisCacheOptions | Expiry) {
    if (typeof options === "string" || typeof options === "number") return { defaultExpiry: options };
    return options;
  }
}
