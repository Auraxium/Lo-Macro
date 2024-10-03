
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

let port = 3009;
let build = 'lo-macro';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: port,
  },
  build: {
    outDir: `./${build}`,
    emptyOutDir: true, // also necessary
  },
})
