const express = require('express');
const client = require('prom-client');

const app = express();
const port = process.env.PORT || 3000;
const serviceName = process.env.SERVICE_NAME || 'order-service';

client.collectDefaultMetrics();

const requestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['service', 'method', 'route', 'status_code']
});

const requestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['service', 'method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});

app.use((req, res, next) => {
  const end = requestDuration.startTimer();

  res.on('finish', () => {
    const labels = {
      service: serviceName,
      method: req.method,
      route: req.path,
      status_code: String(res.statusCode)
    };

    requestCounter.inc(labels);
    end(labels);
  });

  next();
});

app.get('/', (req, res) => {
  res.json({
    service: serviceName,
    message: 'Order service is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: serviceName });
});

app.get('/api/orders', (req, res) => {
  const orders = [
    { id: 101, userId: 1, amount: 125.5, status: 'confirmed' },
    { id: 102, userId: 2, amount: 64.0, status: 'processing' },
    { id: 103, userId: 3, amount: 250.2, status: 'shipped' }
  ];

  res.json({ service: serviceName, orders });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(port, () => {
  console.log(`${serviceName} listening on port ${port}`);
});
