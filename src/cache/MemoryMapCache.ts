import { MapCache } from "../types/MapCache";
import { MemoryCache } from "./base/MemoryCache";

export class MemoryMapCache<Type> extends MemoryCache<Type> implements MapCache<Type> {
  protected readonly store = new Map();

  public async get(key: string): Promise<Type | undefined> {
    const data = this.store.get(key);
    if (data?.expiresAt && Date.now() >= data.expiresAt) {
      this.store.delete(key);
      return;
    }

    return data?.value;
  }

  public async set(key: string, data: Type, ttl?: string): Promise<boolean> {
    const expiresAt = this.getExpiryMs(ttl);
    this.store.set(key, { value: data, expiresAt });
    return true;
  }

  public async has(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  public async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  public async clear(): Promise<void> {
    return this.store.clear();
  }
}
