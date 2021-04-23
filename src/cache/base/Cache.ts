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

  protected getExpiryMs(override?: string): number | undefined {
    if (!override) return this.defaultExpiry;
    return parseTime(override);
  }

  abstract clear(): Promise<void>;
}
