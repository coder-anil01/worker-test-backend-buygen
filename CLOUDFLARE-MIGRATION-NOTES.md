# Cloudflare migration notes

## 1. This is not yet a complete backend migration

Your source code was not supplied. This package only reflects the route filenames visible in the screenshot.
Your existing controllers, models, middleware, helpers and utilities must be inspected for runtime compatibility.

## 2. Worker entry point

The Wrangler config points to `src/worker.js`, which is not included intentionally.
The actual Worker entry point must be created using the current Cloudflare Express integration instructions
for your installed Wrangler/runtime version. Do not assume `app.listen()` behaves like a permanent Node server.

## 3. MongoDB / Mongoose

Do not blindly copy a generic `mongoose.connect()` implementation into production Workers.
Connection lifecycle, TCP/TLS support, pooling and Mongoose compatibility must be validated against the
current Cloudflare MongoDB guidance. Durable Objects can be used for persistent connection management,
but that requires explicit implementation and changes to how DB operations are routed.

Keep your existing db.js until it has been reviewed.

## 4. Node-only APIs to search for

Search the backend for:
- fs / fs.promises / createWriteStream
- local disk uploads or local file paths
- child_process
- native Node addons
- node-cron
- long-lived TCP servers
- packages that depend on unsupported Node internals

Use Cloudflare-compatible alternatives where required:
- Cloudinary or object storage for uploads
- Cron Triggers for scheduled jobs
- Queues for asynchronous jobs
- Workers-compatible APIs for networking and cryptography

## 5. Environment variables

Local:
- Copy `.dev.vars.example` to `.dev.vars`
- Fill actual values

Production:
- Use `npx wrangler secret put SECRET_NAME`
- Configure non-secret variables in Wrangler vars or dashboard

Never put production secrets in frontend Vite variables. VITE_* values are exposed to browsers.

## 6. Required next source files for an exact replacement ZIP

Upload the real project ZIP (without node_modules, .git, dist, build, or secret .env files), or at minimum:
- backend/server.js
- backend/db.js
- backend/package.json
- backend/controllers/
- backend/models/
- backend/routes/
- backend/middlewares/
- backend/helpers/
