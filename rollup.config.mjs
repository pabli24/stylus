import cjs from "rollup-plugin-cjs-es";
import resolve from "@rollup/plugin-node-resolve";
import iife from "rollup-plugin-iife";
import { terser } from "rollup-plugin-terser";
import output from "rollup-plugin-write-output";

import escapeRe from 'escape-string-regexp';

export default {
  input: {
    "codemirror/base": "src/codemirror/base.mjs",
    "codemirror/edit": "src/codemirror/edit.mjs"
  },
  output: {
    dir: "dist",
    chunkFileNames: 'chunks/[name]-[hash].js'
  },
  plugins: [
    resolve(),
    cjs({nested: true}),
    iife(),
    terser({module: false}),
    output([
      {
        test: /codemirror\/edit\.js/,
        target: 'dist/edit.html',
        handle: (content, {htmlScripts}) => replaceLine(content, '<!-- codemirror-edit -->', htmlScripts)
      },
      {
        test: /codemirror\/base\.js/,
        target: 'dist/install-usercss/install-usercss.js',
        handle: (content, {scripts}) => replaceLine(content, '// codemirror-base',
          JSON.stringify(scripts.map(resolvePath('/install-usercss/install-usercss.js'))))
      }
    ])
  ],
  preserveEntrySignatures: false
};

function resolvePath(base) {
  return id => {
    const isAbs = base.startsWith('/');
    const u = new URL(id, `http://dummy${isAbs ? '' : '/'}${base}`);
    return isAbs ? u.pathname : u.pathname.slice(1);
  };
}

function replaceLine(content, marker, repl) {
  return content.replace(new RegExp(`.*${escapeRe(marker)}`), `${repl} ${marker}`);
}
