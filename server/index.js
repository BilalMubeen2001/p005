import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './env.js';
import api from './routes/api.js';

loadEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: '256kb' }));
app.use('/api', api);

/* One process serves the API and the built client, so the whole thing is a
   single URL and there is no CORS surface. */
const dist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(dist));
app.get('*', (req, res, next) =>
  req.path.startsWith('/api/')
    ? next()
    : res.sendFile(path.join(dist, 'index.html'), (err) => (err ? next() : undefined)),
);

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`\n  Reporting assistant running on http://localhost:${PORT}`);
  console.log(
    `  AI prose: ${process.env.ANTHROPIC_API_KEY ? 'on' : 'off (rules only — fully working)'}\n`,
  );
});
