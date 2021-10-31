export function parseRedisBoolean(input: number): boolean {
  return input === 1 ? true : false;
}
