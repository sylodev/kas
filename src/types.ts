export interface MemoryCacheValue<Type> {
  value: Type;
  expiresAt?: number;
}

export enum SetOption {
  KEEP_TTL = "KEEPTTL",
  ONLY_IF_UNSET = "NX",
  ONLY_IF_SET = "XX",
}
