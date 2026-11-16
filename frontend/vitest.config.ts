import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    execArgv: [
      '--import=data:text/javascript,import zlib from "node:zlib";import {syncBuiltinESMExports} from "node:module";if(typeof zlib.createZstdDecompress!=="function"){zlib.createZstdDecompress=zlib.createGunzip;syncBuiltinESMExports();}',
    ],
  },
});
