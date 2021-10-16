import { parseBoolean } from "../helpers/parse-boolean";
import { SetCache } from "../interfaces/set-cache.interface";
import { RedisCache } from "./base.redis";

export class RedisSetCache<Type> extends RedisCache implements SetCache<Type> {
  public async add(data: Type): Promise<boolean> {
    if (data == null) return false;
    const stringified = JSON.stringify(data);
    await this.redis.sadd(this.namespace, stringified);
    return true;
  }

  public async has(data: Type): Promise<boolean> {
    if (data == null) return false;
    const stringified = JSON.stringify(data);
    const exists = await this.redis.sismember(this.namespace, stringified);
    return parseBoolean(exists);
  }

  public async delete(data: Type): Promise<boolean> {
    if (data == null) return false;
    const stringified = JSON.stringify(data);
    await this.redis.srem(this.namespace, stringified);
    return true;
  }

  public async clear(): Promise<void> {
    return super.clear();
  }
}
