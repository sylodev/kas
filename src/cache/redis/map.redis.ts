import { SetOption } from "../../types";
import { Expiry } from "../cache";
import { MapCache } from "../interfaces/map-cache.interface";
import { RedisCache } from "./base.redis";

export class RedisMapCache<Type> extends RedisCache implements MapCache<Type> {
  private readonly membersNamespace = `members:${this.namespace}`;

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
    return exists === 1 ? true : false;
  }

  public async delete(key: string): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);
    if (this.enableClear) await this.redis.srem(this.membersNamespace, prefixedKey);
    await this.redis.del(prefixedKey);
    return true;
  }

  public async clear(): Promise<void> {
    // important so we don't unintentionally obliterate an unrelated set
    return super.clear(this.membersNamespace);
  }
}
