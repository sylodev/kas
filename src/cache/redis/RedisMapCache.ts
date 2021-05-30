import { SetOption } from "../../types";
import { MapCache } from "../base/MapCache";
import { RedisCache } from "./RedisCache";

export class RedisMapCache<Type> extends RedisCache implements MapCache<Type> {
  public async get(key: string): Promise<Type | undefined> {
    const prefixedKey = this.getPrefixedKey(key);
    const stringified = await this.redis.get(prefixedKey);
    if (stringified === null) return;
    return JSON.parse(stringified);
  }

  public async set(key: string, data: Type, ttl?: string | number, mode?: SetOption): Promise<boolean> {
    if (data == null) return false;
    const prefixedKey = this.getPrefixedKey(key);
    const stringified = JSON.stringify(data);
    const params: [string, string, ...any] = [prefixedKey, stringified];
    const expiresIn = this.getRelativeExpiry(ttl);
    if (expiresIn !== undefined) {
      // PX = millisecond precision
      // https://redis.io/commands/set
      params.push("PX", expiresIn);
    }

    if (mode) params.push(mode);
    if (this.enableClear) await this.redis.sadd(this.namespace, prefixedKey);
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
    if (this.enableClear) await this.redis.srem(this.namespace, prefixedKey);
    await this.redis.del(prefixedKey);
    return true;
  }
}
