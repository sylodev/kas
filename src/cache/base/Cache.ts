import { parseTime } from "src/helpers";

export abstract class Cache {
  protected readonly namespace?: string;
  protected readonly defaultExpiry?: number;

  constructor(namespace?: string, defaultExpiry?: string) {
    this.namespace = namespace;
    this.defaultExpiry = parseTime(defaultExpiry);
  }

  protected getPrefixedKey(key: string): string {
    if (!this.namespace) return key;
    return `${this.namespace}:${key}`;
  }

  protected getExpiryDate(override?: string): number | undefined {
    const expireMs = override ? parseTime(override) : this.defaultExpiry;
    if (!expireMs) return;
    return Date.now() + expireMs;
  }

  abstract clear(): Promise<void>;
}
