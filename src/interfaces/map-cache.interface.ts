import { Expiry } from "../cache";

export interface MapCache<Type> {
  get(key: string): Promise<Type | undefined>;
  set(key: string, data: Type, ttl?: Expiry): Promise<boolean>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
}
