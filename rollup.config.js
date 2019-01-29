import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript";
import pkg from "./package.json";

export default [
  {
    input: "src/orca.ts",
    plugins: [resolve(), commonjs(), typescript()],
    output: [
      {
        name: "Orca",
        file: pkg.browser,
        format: "umd"
      },
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" }
    ]
  }
];
