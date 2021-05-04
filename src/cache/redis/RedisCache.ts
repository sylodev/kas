import { Redis, RedisOptions } from "ioredis";
import { resolveRedisInstance } from "../../helpers/resolveRedisInstance";
import { Cache } from "../base/Cache";

export enum SetOption {
  KEEP_TTL = "KEEPTTL",
  ONLY_IF_UNSET = "NX",
  ONLY_IF_SET = "XX",
  EXPIRES_MS = "PX",
}

export interface RedisCacheOptions extends RedisOptions {
  namespace?: string;
  defaultExpiry?: string;
}

export abstract class RedisCache extends Cache {
  protected readonly redis: Redis;

  constructor(host: string | RedisOptions | Redis, options?: RedisCacheOptions) {
    super(options?.namespace, options?.defaultExpiry);
    this.redis = resolveRedisInstance(host, options);
  }

  public async clear(): Promise<void> {
    if (!this.namespace) {
      await this.redis.flushdb();
      return;
    }

    // todo: could use sets for namespaces and require enableExpensiveClear option
    // so users understand that its gonna duplicate keys
  }
}
