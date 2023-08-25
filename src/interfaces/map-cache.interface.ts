import { type Expiry } from "../cache.js";
import { type AsyncReturnValues, type SetOption } from "../types.js";

export interface MapCache<Type> {
  get(key: string): Type | undefined;
  set(key: string, data: Type, ttl?: Expiry, mode?: SetOption[]): boolean;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
}

export type AsyncMapCache<Type> = AsyncReturnValues<MapCache<Type>>;
