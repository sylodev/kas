import { parseRedisBoolean } from "../helpers/parse-redis-boolean";
import { SetCache } from "../interfaces/set-cache.interface";
import { RedisCache } from "./base.redis";

export class RedisSetCache<Type> extends RedisCache implements SetCache<Type> {
  public async add(data: Type) {
    if (data == null) return false;
    const stringified = JSON.stringify(data);
    await this.redis.sadd(this.namespace, stringified);
    return true;
  }

  public async has(data: Type) {
    if (data == null) return false;
    const stringified = JSON.stringify(data);
    const exists = await this.redis.sismember(this.namespace, stringified);
    return parseRedisBoolean(exists);
  }

  public async delete(data: Type) {
    if (data == null) return false;
    const stringified = JSON.stringify(data);
    await this.redis.srem(this.namespace, stringified);
    return true;
  }

  public async clear() {
    return super.clear();
  }
}
