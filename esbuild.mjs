import { dtsPlugin } from "esbuild-plugin-d.ts";
import { build } from "esbuild";

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: "lib",
  platform: "node",
  loader: {
    ".node": "file",
  },
  plugins: [dtsPlugin()],
});
