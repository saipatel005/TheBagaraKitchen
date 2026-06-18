import { defineConfig, loadEnv } from 'vite'
// Trigger restart to load Razorpay keys
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Custom local API database middleware plugin
const localDbPlugin = () => {
  const dbPath = path.resolve(__dirname, 'db.json');

  // Initialize db.json if not exists
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ initialized: false }, null, 2));
  }

  return {
    name: 'local-db-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/data') {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            const data = fs.readFileSync(dbPath, 'utf-8');
            res.end(data);
          } else if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                fs.writeFileSync(dbPath, JSON.stringify(parsed, null, 2));
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
              }
            });
          }
        } else if (req.url === '/api/send-email') {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                req.body = JSON.parse(body);

                // Attach Vercel-like helpers for local middleware compatibility
                res.status = (code) => {
                  res.statusCode = code;
                  return res;
                };
                res.json = (data) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return res;
                };

                const { default: sendEmailHandler } = await import('./api/send-email.js');
                await sendEmailHandler(req, res);
              } catch (e) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: e.message }));
              }
            });
          }
        } else if (req.url === '/api/create-razorpay-order') {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                req.body = JSON.parse(body);

                // Attach Vercel-like helpers for local middleware compatibility
                res.status = (code) => {
                  res.statusCode = code;
                  return res;
                };
                res.json = (data) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return res;
                };

                const { default: createRazorpayHandler } = await import('./api/create-razorpay-order.js');
                await createRazorpayHandler(req, res);
              } catch (e) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: e.message }));
              }
            });
          }
        } else {
          next();
        }
      });
    }
  };
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from the root .env file and assign to process.env
  const env = loadEnv(mode, process.cwd(), '');
  process.env.SMTP_HOST = env.SMTP_HOST || 'smtp.gmail.com';
  process.env.SMTP_PORT = env.SMTP_PORT || '587';
  process.env.SMTP_USER = env.SMTP_USER || 'developer.tbk1@gmail.com';
  process.env.SMTP_PASS = env.SMTP_PASS || 'kmjtqvagitxlwgir';
  process.env.SMTP_ADMIN_EMAIL = env.SMTP_ADMIN_EMAIL || 'thebagarakitchen.bar@gmail.com';
  process.env.VITE_RAZORPAY_KEY_ID = env.VITE_RAZORPAY_KEY_ID || 'rzp_test_Sw2XA2RVzxAmX0';
  process.env.RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET || 'qyBQT62H1JykVx4qZzNgQB0I';

  return {
    plugins: [react(), tailwindcss(), localDbPlugin()],
    server: {
      host: true, // Exposes Vite on the local network (0.0.0.0) so your mobile phone can connect!
      watch: {
        ignored: ['**/db.json'] // Prevent infinite HMR refresh loops when writing data locally!
      }
    }
  };
});
