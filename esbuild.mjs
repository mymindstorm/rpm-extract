import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/index.js"],
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: "lib",
  platform: "node",
  loader: {
    ".node": "file",
  },
});
