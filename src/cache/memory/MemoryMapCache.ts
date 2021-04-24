import { MapCache } from "../base/MapCache";
import { MemoryCache, MemoryCacheValue } from "./MemoryCache";

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

  public async set(key: string, data: Type, ttl?: string): Promise<boolean> {
    const expiresIn = this.getRelativeExpiry(ttl);
    const expiresAt = expiresIn !== undefined ? Date.now() + expiresIn : undefined;
    this.store.set(key, { value: data, expiresAt });
    return true;
  }

  public async has(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  public async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }
}
