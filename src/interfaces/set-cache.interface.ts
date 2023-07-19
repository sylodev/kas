import { AsyncReturnValues } from "../types.js";

export interface SetCache<Type> {
  add(value: Type): boolean;
  has(value: Type): boolean;
  delete(value: Type): boolean;
  clear(): void;
}

export type AsyncSetCache<T> = AsyncReturnValues<SetCache<T>>;
