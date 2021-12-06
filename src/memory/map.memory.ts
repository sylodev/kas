import { Cache, Expiry } from "../cache";
import { MapCache } from "../interfaces/map-cache.interface";

export class MemoryMapCache<Type> extends Cache implements MapCache<Type> {
  protected readonly store = new Map<string, Type>();
  private readonly timers = new Map<string, NodeJS.Timeout>();

  constructor(defaultExpiry?: Expiry) {
    super(undefined, defaultExpiry);
  }

  public set(key: string, data: Type, ttl?: Expiry) {
    if (data === undefined) return true;
    const expiresIn = this.getRelativeExpiry(ttl);
    this.store.set(key, data);
    const timerId = setTimeout(() => this.store.delete(key), expiresIn);
    this.timers.set(key, timerId);
    return true;
  }

  public get(key: string) {
    return this.store.get(key);
  }

  public has(key: string) {
    return this.store.has(key);
  }

  public delete(key: string) {
    const timerId = this.timers.get(key);
    if (timerId) clearTimeout(timerId);
    return this.store.delete(key);
  }

  public clear() {
    for (const timerId of this.timers.values()) clearTimeout(timerId);
    this.timers.clear();
    return this.store.clear();
  }
}
