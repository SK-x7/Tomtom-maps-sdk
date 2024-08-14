import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import eslint from "vite-eslint-plugin"

export default defineConfig({
  plugins: [react(),eslint()],
})
