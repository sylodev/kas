import { Redis, RedisOptions } from "ioredis";
import { resolveRedisInstance } from "../../helpers/resolveRedisInstance";
import { Cache } from "../base/Cache";

export interface RedisCacheOptions extends RedisOptions {
  defaultExpiry?: string | number;
  enableExpensiveClear?: boolean;
}

export abstract class RedisCache extends Cache {
  // required to hopefully avoid collisions
  protected readonly namespace: string;
  protected readonly redis: Redis;
  protected readonly enableClear?: boolean;

  constructor(host: string | RedisOptions | Redis, namespace: string, options?: RedisCacheOptions) {
    super(undefined, options?.defaultExpiry);
    this.namespace = namespace;
    this.enableClear = options?.enableExpensiveClear;
    this.redis = resolveRedisInstance(host, options);
  }

  public async clear(): Promise<void> {
    if (!this.enableClear) throw new Error("Enable expensive clear option to clear redis caches.");
    const members = await this.redis.smembers(this.namespace);
    await this.redis.del(members.concat(this.namespace));
    return;
  }
}
