import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript";
import pkg from "./package.json";

export default [
  {
    input: "src/orca.ts",
    output: {
      name: "Orca",
      file: pkg.browser,
      format: "umd"
    },
    plugins: [resolve(), commonjs(), typescript()]
  },
  {
    input: "src/orca.ts",
    plugins: [typescript()],
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" }
    ]
  }
];
