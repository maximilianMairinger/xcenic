import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import dotenvPlugin from "rollup-plugin-inject-process-env"
import dotenv from 'dotenv'
dotenv.config()

export default {
  input: 'server/src/server.ts',
  output: {
    file: 'server/dist/server.js',
    format: 'cjs'
  },
  plugins: [
    typescript({tsconfig: "./tsconfig.server.json", noEmitOnError: false}), 
    resolve({modulesOnly: true, preferBuiltins: true}),
    commonJS({
      include: 'node_modules/**'
    }),
    json(),
    dotenvPlugin({
      MAIL_USER: process.env.MAIL_USER,
      MAIL_PASSWORD: process.env.MAIL_PASSWORD,

    })
  ]
};
