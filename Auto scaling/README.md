# Auto-Scaling Microservices System

A Docker-based microservices stack with:
- Nginx API gateway
- Two Node.js microservices (`user-service`, `order-service`)
- Prometheus metrics collection
- Grafana dashboards
- Simple CPU-based auto-scaling helper script

## Architecture

- `nginx` routes incoming traffic:
  - `/users/*` -> `user-service`
  - `/orders/*` -> `order-service`
- Each service exposes:
  - API endpoints
  - `/health`
  - `/metrics` (Prometheus format)
- `prometheus` scrapes service + container metrics
- `grafana` visualizes traffic, latency, and CPU
- `scripts/auto_scale.sh` scales services up/down based on CPU

## Start the stack

```bash
docker compose up -d --build
```

## Endpoints

- Gateway: `http://localhost`
- Users API: `http://localhost/users/api/users`
- Orders API: `http://localhost/orders/api/orders`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`
  - Username: `admin`
  - Password: `admin`

## Manual scaling

```bash
docker compose up -d --scale user-service=3 --scale order-service=2
```

## Auto-scaling helper

Run auto-scaling loop for one service:

```bash
./scripts/auto_scale.sh user-service
```

Environment overrides:
- `MIN_REPLICAS` (default `1`)
- `MAX_REPLICAS` (default `5`)
- `SCALE_UP_CPU` (default `65`)
- `SCALE_DOWN_CPU` (default `20`)
- `COOLDOWN_SECONDS` (default `60`)
- `PROM_URL` (default `http://localhost:9090`)

Example:

```bash
MIN_REPLICAS=2 MAX_REPLICAS=6 SCALE_UP_CPU=55 ./scripts/auto_scale.sh order-service
```

## Stop the stack

```bash
docker compose down
```

## Project structure

```text
.
├── docker-compose.yml
├── nginx/nginx.conf
├── prometheus/prometheus.yml
├── grafana/
│   ├── provisioning/
│   └── dashboards/system-overview.json
├── services/
│   ├── user-service/
│   └── order-service/
└── scripts/auto_scale.sh
```
