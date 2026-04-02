import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';
import fs from 'fs';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: '/AI-Workspace/',
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }), 
    tsconfigPaths(),
    {
      name: 'admin-password-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/verify-admin' || req.url === '/AI-Workspace/api/verify-admin') {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });
              req.on('end', () => {
                try {
                  const { password } = JSON.parse(body);
                  // Read password from db.json
                  const dbPath = path.resolve(__dirname, 'db.json');
                  let validPassword = 'trae'; // default fallback
                  if (fs.existsSync(dbPath)) {
                    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                    if (db.adminPassword) {
                      validPassword = db.adminPassword;
                    }
                  }
                  
                  res.setHeader('Content-Type', 'application/json');
                  if (password === validPassword) {
                    res.end(JSON.stringify({ success: true }));
                  } else {
                    res.statusCode = 401;
                    res.end(JSON.stringify({ success: false, error: '密码错误' }));
                  }
                } catch (e) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
                }
              });
            } else {
              res.statusCode = 405;
              res.end('Method Not Allowed');
            }
          } else {
            next();
          }
        });
      }
    }
  ],
})
