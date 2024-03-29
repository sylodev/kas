import { Cache, type Expiry } from "../cache.js";
import { type MapCache } from "../interfaces/map-cache.interface.js";

export class MemoryMapCache<Type> extends Cache implements MapCache<Type> {
  protected readonly store = new Map<string, Type>();
  private readonly timers = new Map<string, NodeJS.Timeout>();

  constructor(defaultExpiry?: Expiry) {
    super(undefined, defaultExpiry);
  }

  /**
   * Add an item to the cache.
   */
  public set(key: string, data: Type, ttl?: Expiry) {
    if (data === undefined) return true;
    const expiresIn = this.getRelativeExpiry(ttl);
    this.store.set(key, data);
    const timerId = setTimeout(() => this.store.delete(key), expiresIn);
    this.timers.set(key, timerId);
    return true;
  }

  /**
   * Get a keys value from the cache.
   */
  public get<T extends Type>(key: string): T {
    return this.store.get(key) as T;
  }

  /**
   * Check if the cache has a key.
   */
  public has(key: string) {
    return this.store.has(key);
  }

  /**
   * Delete a key from the cache.
   */
  public delete(key: string) {
    const timerId = this.timers.get(key);
    if (timerId) clearTimeout(timerId);
    return this.store.delete(key);
  }

  /**
   * Clear all items in the cache.
   */
  public clear() {
    for (const timerId of this.timers.values()) clearTimeout(timerId);
    this.timers.clear();
    return this.store.clear();
  }
}
