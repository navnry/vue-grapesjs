import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    {
      name: 'tailwind-publish-api',
      configureServer(server) {
        server.middlewares.use('/api/tailwind', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end('Method Not Allowed')
            return
          }

          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}')
              const classes: string[] = Array.isArray(payload.classes) ? payload.classes : []
              const raw = classes.map((cls) => `<div class="${cls}"></div>`).join('\n')
              const config = {
                content: [{ raw, extension: 'html' }],
                corePlugins: { preflight: false },
              }
              const input = '@tailwind utilities;'
              const result = await postcss([tailwindcss(config), autoprefixer]).process(input, {
                from: undefined,
              })
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ css: result.css }))
            } catch (error: any) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: error?.message || 'Unknown error' }))
            }
          })
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
