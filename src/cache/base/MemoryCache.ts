import { Cache } from "./Cache";

export interface MemoryCacheValue<Type> {
  value: Type;
  expiresAt?: number;
}

type MemoryCacheStore<Type> = Map<string, MemoryCacheValue<Type>> | Set<MemoryCacheValue<Type>>;

export abstract class MemoryCache<Type> extends Cache {
  private static readonly CACHE_SAMPLES = 20;
  private static readonly CACHE_RECHECK_COUNT = (100 * MemoryCache.CACHE_SAMPLES) / 25;
  protected abstract readonly store: MemoryCacheStore<Type>;

  constructor(defaultExpiry?: string) {
    super(undefined, defaultExpiry);
    setInterval(this.checkForExpiredKeys.bind(this), 100);
  }

  // implements basically the same algorithm redis uses https://redis.io/commands/expire#how-redis-expires-keys
  // github.com/sylv did most of this :)
  private checkForExpiredKeys(): void {
    if (this.store.size === 0) return;
    const items = Array.from<any>(this.store.entries());
    const size = items.length;
    let expired = 0;
    for (let i = 0; i < MemoryCache.CACHE_SAMPLES; i++) {
      const index = Math.floor(Math.random() * size) + 1;
      const item = items[index - 1];
      if (!item || item[1].expiresAt === undefined) continue;
      if (Date.now() > item[1].expiresAt) {
        this.store.delete(item[0]);
        expired += 1;
      }
    }

    if (expired >= MemoryCache.CACHE_RECHECK_COUNT) this.checkForExpiredKeys();
  }
}
