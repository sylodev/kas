export interface SetCache<Type> {
  add(value: Type): Promise<boolean>;
  has(value: Type): Promise<boolean>;
  delete(value: Type): Promise<boolean>;
  clear(): Promise<void>;
}
