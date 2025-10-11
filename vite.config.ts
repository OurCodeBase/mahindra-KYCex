import { defineConfig } from 'vite'
import manifest from './manifest.json'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
})
