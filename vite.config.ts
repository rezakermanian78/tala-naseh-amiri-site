import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Inlines the (small) built stylesheet into index.html to remove a render-blocking request.
function inlineCss(): Plugin {
  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html
        for (const [file, asset] of Object.entries(ctx.bundle)) {
          if (asset.type === 'asset' && file.endsWith('.css')) {
            const css = String(asset.source)
            delete ctx.bundle[file]
            return html.replace(
              new RegExp(`<link[^>]*href="[^"]*${file.split('/').pop()}"[^>]*>`),
              () => `<style>${css}</style>`,
            )
          }
        }
        return html
      },
    },
  }
}

export default defineConfig({ plugins: [react(), inlineCss()] })
