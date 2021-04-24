import ms from "ms";

export abstract class Cache {
  protected readonly namespace?: string;
  protected readonly defaultExpiry?: number;

  constructor(namespace?: string, defaultExpiry?: string) {
    this.namespace = namespace;
    this.defaultExpiry = defaultExpiry ? ms(defaultExpiry) : undefined;
  }

  protected getPrefixedKey(key: string): string {
    if (!this.namespace) return key;
    return `${this.namespace}:${key}`;
  }

  protected getRelativeExpiry(value?: string): number | undefined {
    if (value !== undefined) {
      const parsed = ms(value);
      if (parsed === undefined) throw new Error(`Cannot parse "${value}" as a duration.`);
      return parsed;
    }

    return this.defaultExpiry;
  }
}
