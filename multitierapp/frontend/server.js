import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const backendBaseUrl = process.env.BACKEND_URL || 'http://backend-service:5000';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

async function proxyToBackend(req, res) {
  try {
    const response = await fetch(`${backendBaseUrl}${req.url}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: req.method === 'GET' ? undefined : JSON.stringify(req.body)
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    res.status(502).json({ error: `Backend unavailable: ${error.message}` });
  }
}

app.use('/api', proxyToBackend);
app.use('/health', proxyToBackend);

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Frontend listening on port ${port}`);
  console.log(`Proxying API requests to ${backendBaseUrl}`);
});
