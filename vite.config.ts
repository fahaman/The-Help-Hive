import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

import type { ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "http";

const otpLoggerPlugin = () => ({
  name: 'otp-logger',
  configureServer(server: ViteDevServer) {
    server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
      if (req.url === '/api/log-otp' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            console.log('\x1b[36m%s\x1b[0m', `\n[SERVER] 📱 SMS INTERCEPTED -> ${data.message}\n`);
          } catch (e) {
            // Ignore parse errors
          }
          res.statusCode = 200;
          res.end('OK');
        });
      } else {
        next();
      }
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), otpLoggerPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
