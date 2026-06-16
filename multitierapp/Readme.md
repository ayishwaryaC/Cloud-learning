# Project 2: Kubernetes Multi-Tier App

This project demonstrates communication between services in Kubernetes:

- Frontend: React UI + Node proxy container (port 3000)
- Backend: Node.js + Express API (port 5000)
- Database: MongoDB (port 27017)

The key learning goals are:

- Service-to-service communication
- Internal DNS names (`<service>.<namespace>.svc.cluster.local`)
- `ClusterIP` networking inside the cluster

## Architecture

```text
Browser
  -> NodePort Service (frontend-nodeport:30080)
  -> Frontend Pod (React static files + Node proxy)
  -> Backend Service (ClusterIP: backend-service:5000)
  -> Backend Pods (Node.js)
  -> Mongo Service (ClusterIP: mongo-service:27017)
  -> Mongo Pod
```

Important: Browser traffic is external, so it cannot resolve cluster DNS names directly.
The frontend container proxies `/api/*` to `backend-service`, so service discovery stays inside the cluster.

## Folder Structure

```text
multitierapp/
  backend/
  frontend/
  k8s/
```

## 1) Build Docker Images

From the `multitierapp` folder:

```bash
docker build -t multitier-backend:1.0 ./backend
docker build -t multitier-frontend:1.0 ./frontend
```

If using Minikube, load images into Minikube runtime:

```bash
minikube image load multitier-backend:1.0
minikube image load multitier-frontend:1.0
```

## 2) Deploy to Kubernetes

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mongo.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/gateway.yaml
```

Check resources:

```bash
kubectl get all -n multitier-demo
```

## 3) Access the Frontend

If your cluster supports NodePort directly:

- `http://<NODE_IP>:30080`
to get the node ip just use the minikube ip u will get the node ip --- bcoz the minikubeip is used to acess the browser 

http://192.168.49.2:30080



For Minikube:

```bash
minikube service frontend-nodeport -n multitier-demo --url
```

## 4) Verify Service-to-Service Communication

### Backend resolves Mongo service DNS

```bash
kubectl exec -n multitier-demo deploy/backend -- nslookup mongo-service
```

### Frontend Pod resolves backend service DNS

```bash
kubectl exec -n multitier-demo deploy/frontend -- nslookup backend-service
```

### Frontend Pod can call backend through ClusterIP service

```bash
kubectl exec -n multitier-demo deploy/frontend -- wget -qO- http://backend-service:5000/health
```

### View app data from your machine

```bash
kubectl port-forward -n multitier-demo svc/backend-service 5000:5000
curl http://localhost:5000/api/messages
```

## 5) How ClusterIP + DNS Works

- `ClusterIP` exposes a stable virtual IP that is reachable only inside the cluster.
- Pods are ephemeral and Pod IPs change, so workloads should call service names instead of Pod IPs.
- Kubernetes DNS resolves names like:
  - `backend-service`
  - `backend-service.multitier-demo`
  - `backend-service.multitier-demo.svc.cluster.local`

Examples in this project:

- Frontend proxy -> `http://backend-service.multitier-demo.svc.cluster.local:5000`
- Backend -> `mongodb://mongo-service.multitier-demo.svc.cluster.local:27017/appdb`

## Cleanup

```bash
kubectl delete namespace multitier-demo
```
