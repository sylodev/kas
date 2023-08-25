import { randomBytes } from "crypto";
import dedent from "dedent";
import type { Options } from "tsup";

const requireAlias = `_` + randomBytes(8).toString("hex");
const compatScript = dedent`
    import { createRequire as ${requireAlias} } from 'module';
    const require = ${requireAlias}(import.meta.url);
`;

export const tsup: Options = {
  sourcemap: true,
  keepNames: true,
  dts: true,
  clean: true,
  minify: false,
  format: "esm",
  platform: "node",
  target: "node18",
  entryPoints: ["src/index.ts"],
  banner: {
    js: compatScript,
  },
};
