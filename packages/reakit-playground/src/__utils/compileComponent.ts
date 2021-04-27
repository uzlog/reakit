import * as React from "react";
import * as ReactDOM from "react-dom";
// import { transform } from "buble";
import {
  transform,
  availablePresets,
  availablePlugins,
} from "@babel/standalone";
import deps from "../__deps";
import { importToRequire } from "./importToRequire";

console.log(availablePresets);

export function compileComponent(
  code: string,
  depsMap?: Record<string, any>,
  componentName = "Example"
): React.ComponentType {
  const defaultDeps = {
    react: React,
    "react-dom": ReactDOM,
  };
  //   const fullCode = `
  // ${importToRequire(code)}
  // export default ${componentName};
  // `;
  const req = (path: keyof typeof deps) => {
    if (path in deps) {
      return deps[path];
    }
    if (depsMap && path in depsMap) {
      return depsMap[path];
    }
    if (path in defaultDeps) {
      return defaultDeps[path as keyof typeof defaultDeps];
    }
    throw new Error(`Unable to resolve path to module '${path}'.`);
  };
  const { code: compiledCode } = transform(code, {
    filename: "file.tsx",
    presets: [
      [availablePresets.env],
      availablePresets.react,
      [availablePresets.typescript],
    ],
  });
  // eslint-disable-next-line no-new-func
  const fn = new Function(
    "require",
    "exports",
    "React",
    `${compiledCode}; return exports.default`
  );
  return fn(req, {}, React);
}
