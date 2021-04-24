export abstract class MapCache<Type> {
  abstract get(key: string): Promise<Type | undefined>;
  abstract set(key: string, data: Type, ttl?: string): Promise<boolean>;
  abstract has(key: string): Promise<boolean>;
  abstract delete(key: string): Promise<boolean>;
  abstract clear(): Promise<void>;
}
