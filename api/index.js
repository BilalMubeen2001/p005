import express from 'express';
import { loadEnv } from '../server/env.js';
import apiRoutes from '../server/routes/api.js';

/**
 * Vercel entry point.
 *
 * Vercel runs each file in /api as a serverless function rather than a
 * long-running process, so there is no app to "start" and nothing serves the
 * client — Vercel serves client/dist as static files itself. This file exposes
 * only the API.
 *
 * An Express app is already a (req, res) handler, so exporting it directly is
 * all Vercel needs.
 *
 * server/index.js is untouched and still runs the whole thing locally with
 * npm start. Both entry points share the same routes, so there is one
 * implementation and no risk of the two drifting apart.
 */

loadEnv();

const app = express();
app.use(express.json({ limit: '256kb' }));
app.use('/api', apiRoutes);

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

export default app;
