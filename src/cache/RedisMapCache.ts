import { MapCache } from "src/types/MapCache";
import { parseTime } from "../helpers";
import { RedisCache } from "./base/RedisCache";

export class RedisMapCache<Type> extends RedisCache implements MapCache<Type> {
  public async get(key: string): Promise<Type | undefined> {
    const prefixedKey = this.getPrefixedKey(key);
    const data = await this.redis.get(prefixedKey);
    if (data === null) return;
    return JSON.parse(data);
  }

  public async set(key: string, data: Type, ttl?: string | "KEEPTTL"): Promise<boolean> {
    if (data == null) return false;
    const prefixedKey = this.getPrefixedKey(key);
    const payload = JSON.stringify(data);
    if (!ttl) await this.redis.set(prefixedKey, payload);
    else if (ttl === "KEEPTTL") await this.redis.set(prefixedKey, payload, "KEEPTTL");
    else await this.redis.set(prefixedKey, payload, "PX", parseTime(ttl));

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
