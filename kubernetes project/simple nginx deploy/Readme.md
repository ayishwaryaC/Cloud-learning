# 🚀 Kubernetes Nginx Deployment using Minikube

## 📌 Project Overview

This project demonstrates how to deploy an Nginx application using Kubernetes on a local Minikube cluster. It covers the complete workflow from deployment creation to scaling and understanding Kubernetes self-healing.

---

## ⚙️ Step 1: Start Minikube

```bash
minikube start
```

✔️ Initializes a local Kubernetes cluster using Docker driver.

---

## 📦 Step 2: Create Deployment

```bash
kubectl create deployment nginx --image=nginx
```

✔️ Creates a **Deployment** named `nginx`
✔️ Automatically manages Pods and ReplicaSets

---

## 🔍 Step 3: Verify Resources

### Check Deployment

```bash
kubectl get deployment
```

### Check Pods

```bash
kubectl get pods
```

### Check ReplicaSet

```bash
kubectl get rs
```

---

## 🌐 Step 4: Expose Application

```bash
kubectl expose deployment nginx --type=NodePort --port=80
```

✔️ Creates a **Service**
✔️ Exposes the application outside the cluster

---

## 🔗 Step 5: Access Application

```bash
minikube service nginx
```

✔️ Opens the application in your browser

---

## 📈 Step 6: Scaling the Application

```bash
kubectl scale deployment nginx --replicas=3
```

✔️ Increases the number of Pods to **3**

### Verify Scaling

```bash
kubectl get pods
```

✔️ You will see 3 running Pods

---

## 🔁 Step 7: Self-Healing in Kubernetes

### Delete a Pod

```bash
kubectl delete pod <pod-name>
```

✔️ Kubernetes automatically creates a new Pod

---

### Delete All Pods

```bash
kubectl delete pods --all
```

✔️ All Pods are deleted
✔️ New Pods are automatically recreated

---

## 🧠 Key Concept: ReplicaSet

* Maintains desired number of Pods
* Detects missing Pods
* Automatically recreates them

---

## 🔥 Why Kubernetes is Called Self-Healing?

When a Pod crashes or is deleted:

✔️ Kubernetes detects the issue
✔️ ReplicaSet creates a new Pod
✔️ Application continues running without downtime

---

## 🏗️ Architecture Flow

```
Deployment
    ↓
ReplicaSet
    ↓
Pods
    ↓
Container (Nginx)
```

---

## 📌 Conclusion

This project demonstrates:

* Deployment creation
* Service exposure
* Scaling Pods
* Kubernetes self-healing capability

Kubernetes ensures high availability and reliability by automatically managing application state.

---

## 🛠️ Commands Summary

| Action            | Command                                                     |
| ----------------- | ----------------------------------------------------------- |
| Start cluster     | `minikube start`                                            |
| Create deployment | `kubectl create deployment nginx --image=nginx`             |
| Expose service    | `kubectl expose deployment nginx --type=NodePort --port=80` |
| Scale pods        | `kubectl scale deployment nginx --replicas=3`               |
| Delete pod        | `kubectl delete pod <pod-name>`                             |
| Delete all pods   | `kubectl delete pods --all`                                 |

---

## ✨ Final Note

Kubernetes simplifies container orchestration by automating deployment, scaling, and healing — making it a powerful tool for modern applications.
