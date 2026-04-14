import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { changelogMdFromRootPlugin } from './vite/changelog-md-plugin'

export default defineConfig({
  plugins: [react(), changelogMdFromRootPlugin()],
})

