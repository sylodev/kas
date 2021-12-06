import { AsyncSetCache } from "../interfaces/set-cache.interface";
import { RedisCache } from "./base.redis";

export class RedisSetCache<Type> extends RedisCache implements AsyncSetCache<Type> {
  /**
   * Add an item to the set.
   */
  public async add(data: Type): Promise<boolean> {
    if (data == null) return false;
    const stringified = JSON.stringify(data);
    await this.redis.sadd(this.namespace, stringified);
    return true;
  }

  /**
   * Check whether the set has an item.
   */
  public async has(data: Type): Promise<boolean> {
    if (data == null) return false;
    const stringified = JSON.stringify(data);
    const exists = await this.redis.sismember(this.namespace, stringified);
    return exists === 1 ? true : false;
  }

  /**
   * Delete an item from the set.
   */
  public async delete(data: Type): Promise<boolean> {
    if (data == null) return false;
    const stringified = JSON.stringify(data);
    await this.redis.srem(this.namespace, stringified);
    return true;
  }

  /**
   * Clear all items in the set.
   */
  public async clear(): Promise<void> {
    await this.redis.del(this.namespace);
  }
}
