import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
		name: 'build-date-replace',
		transform(code, id) {
			if (id.endsWith('HelpModalContent.vue')) {
				const timestamp = new Date().toLocaleString('de');
				return code.replace('__BUILD_TIMESTAMP__', JSON.stringify(timestamp));
			}
			return code
		}
	},
	vue()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
