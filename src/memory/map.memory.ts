import { Expiry } from "../cache";
import { MapCache } from "../interfaces/map-cache.interface";
import { MemoryCache, MemoryCacheValue } from "./base.memory";

export class MemoryMapCache<Type> extends MemoryCache<Type> implements MapCache<Type> {
  protected readonly store = new Map<string, MemoryCacheValue<Type>>();

  public async get(key: string): Promise<Type | undefined> {
    const data = this.store.get(key);
    if (data?.expiresAt && Date.now() >= data.expiresAt) {
      this.store.delete(key);
      return;
    }

    return data?.value;
  }

  public async set(key: string, data: Type, ttl?: Expiry): Promise<boolean> {
    if (data == null) return false;
    const expiresIn = this.getRelativeExpiry(ttl);
    const expiresAt = expiresIn !== undefined ? Date.now() + expiresIn : undefined;
    this.store.set(key, { value: data, expiresAt });
    return true;
  }

  public async has(key: string): Promise<boolean> {
    const data = this.store.get(key);
    if (data === undefined) return false;
    if (data.expiresAt && Date.now() >= data.expiresAt) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  public async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  public async clear(): Promise<void> {
    return this.store.clear();
  }
}
