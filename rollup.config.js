import babel from "@rollup/plugin-babel";
import * as meta from "./package.json";

export default {
  input: "./out-tsc/src/app.js",
  external: ["d3"],
  output: {
    file: `build/app.js`,
    name: "d3",
    format: "umd",
    indent: false,
    extend: true,
    // banner: `// ${meta.homepage} v${meta.version} Copyright ${(new Date).getFullYear()} ${meta.author}`,
    globals: {d3: "d3"},
    plugins: [
      babel({
        exclude: "node_modules/**"})
    ]
  },
};