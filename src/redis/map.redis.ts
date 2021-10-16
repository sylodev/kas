import { Expiry } from "../cache";
import { parseBoolean } from "../helpers/parse-boolean";
import { RedisHost } from "../helpers/resolve-redis-instance";
import { MapCache } from "../interfaces/map-cache.interface";
import { SetOption } from "../types";
import { RedisCache, RedisCacheOptions } from "./base.redis";

export class RedisMapCache<Type> extends RedisCache implements MapCache<Type> {
  private readonly enableClear?: boolean;
  private readonly membersNamespace = `members:${this.namespace}`;

  constructor(host: RedisHost, namespace: string, options?: RedisCacheOptions | Expiry) {
    super(host, namespace, RedisMapCache.resolveOptions(options));
    this.enableClear = this.options?.enableExpensiveClear;
  }

  public async get(key: string): Promise<Type | undefined> {
    const prefixedKey = this.getPrefixedKey(key);
    const stringified = await this.redis.get(prefixedKey);
    if (stringified === null) return;
    return JSON.parse(stringified);
  }

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
    if (this.enableClear) await this.redis.sadd(this.membersNamespace, prefixedKey);
    await this.redis.set(...params);
    return true;
  }

  public async has(key: string): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);
    const exists = await this.redis.exists(prefixedKey);
    return parseBoolean(exists);
  }

  public async delete(key: string): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);
    if (this.enableClear) await this.redis.srem(this.membersNamespace, prefixedKey);
    await this.redis.del(prefixedKey);
    return true;
  }

  public async clear(): Promise<void> {
    if (!this.enableClear)
      throw new Error(
        "Enable expensive clear option to clear redis caches. Please keep in mind, previously set key-value pairs will not be cleared."
      );
    // important so we don't unintentionally obliterate an unrelated set
    return super.clear(this.membersNamespace);
  }

  static resolveOptions(options?: RedisCacheOptions | Expiry) {
    if (typeof options === "string" || typeof options === "number") return { defaultExpiry: options };
    return options;
  }
}
