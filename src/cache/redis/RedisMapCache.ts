import { MapCache } from "../base/MapCache";
import { RedisCache } from "./RedisCache";

export class RedisMapCache<Type> extends RedisCache implements MapCache<Type> {
  public async get(key: string): Promise<Type | undefined> {
    const prefixedKey = this.getPrefixedKey(key);
    const stringified = await this.redis.get(prefixedKey);
    if (stringified === null) return;
    return JSON.parse(stringified);
  }

  public async set(key: string, data: Type, ttl?: string | "KEEPTTL"): Promise<boolean> {
    if (data == null) return false;
    const prefixedKey = this.getPrefixedKey(key);
    const stringified = JSON.stringify(data);
    switch (ttl) {
      case undefined:
        await this.redis.set(prefixedKey, stringified);
        break;
      case "KEEPTTL":
        await this.redis.set(prefixedKey, stringified, "KEEPTTL");
        break;
      default: {
        const expiresIn = this.getRelativeExpiry(ttl);
        // PX = millisecond precision
        // https://redis.io/commands/set
        await this.redis.set(prefixedKey, stringified, "PX", expiresIn);
        break;
      }
    }

    return true;
  }

  public async has(key: string): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);
    const exists = await this.redis.exists(prefixedKey);
    return exists === 1 ? true : false;
  }

  public async delete(key: string): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);
    await this.redis.del(prefixedKey);
    return true;
  }

  public async clear(): Promise<void> {
    if (!this.namespace) {
      await this.redis.flushdb();
      return;
    }
  }
}
