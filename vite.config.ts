import { defineConfig } from 'vite'
import manifest from './manifest.json'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import zip from 'vite-plugin-zip-pack'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    crx({ manifest }),
    zip({ outDir: 'release', outFileName: 'release.zip' })
  ],
})
