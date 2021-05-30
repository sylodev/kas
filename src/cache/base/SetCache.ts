export abstract class SetCache<Type> {
  abstract add(value: Type): Promise<boolean>;
  abstract has(value: Type): Promise<boolean>;
  abstract delete(value: Type): Promise<boolean>;
  abstract clear(): Promise<void>;
}
