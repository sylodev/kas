import type { Options } from "tsup";

export const tsup: Options = {
  sourcemap: true,
  dts: true,
  clean: true,
  minify: true,
  entryPoints: ["src/index.ts"],
};
