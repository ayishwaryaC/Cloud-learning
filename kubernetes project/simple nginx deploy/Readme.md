rajaragavan@Rajas-MacBook-Air  simple nginx deploy % minikube start
😄  minikube v1.38.1 on Darwin 26.0 (arm64)
✨  Automatically selected the docker driver
❗  Starting v1.39.0, minikube will default to "containerd" container runtime. See #21973 for more info.
📌  Using Docker Desktop driver with root privileges
👍  Starting "minikube" primary control-plane node in "minikube" cluster
🚜  Pulling base image v0.0.50 ...
💾  Downloading Kubernetes v1.35.1 preload ...
    > preloaded-images-k8s-v18-v1...:  243.95 MiB / 243.95 MiB  100.00% 3.24 Mi
    > gcr.io/k8s-minikube/kicbase...:  483.40 MiB / 483.40 MiB  100.00% 2.97 Mi
🔥  Creating docker container (CPUs=2, Memory=3072MB) ...
🐳  Preparing Kubernetes v1.35.1 on Docker 29.2.1 ...
🔗  Configuring bridge CNI (Container Networking Interface) ...
🔎  Verifying Kubernetes components...
    ▪ Using image gcr.io/k8s-minikube/storage-provisioner:v5
🌟  Enabled addons: default-storageclass, storage-provisioner
🏄  Done! kubectl is now configured to use "minikube" cluster and "default" namespace by default
rajaragavan@Rajas-MacBook-Air  simple nginx deploy % kubectl create deployment nginx --image=nginx
deployment.apps/nginx created
rajaragavan@Rajas-MacBook-Air  simple nginx deploy % kubectl get deployment
NAME    READY   UP-TO-DATE   AVAILABLE   AGE
nginx   1/1     1            1           108s
rajaragavan@Rajas-MacBook-Air  simple nginx deploy % kubectl get pods      
NAME                     READY   STATUS    RESTARTS   AGE
nginx-56c45fd5ff-b4hj9   1/1     Running   0          2m9s
rajaragavan@Rajas-MacBook-Air  simple nginx deploy % kubectl get rs  
NAME               DESIRED   CURRENT   READY   AGE
nginx-56c45fd5ff   1         1         1       2m21s
rajaragavan@Rajas-MacBook-Air  simple nginx deploy % kubectl expose deployment nginx --type=NodePort --port=80
service/nginx exposed
rajaragavan@Rajas-MacBook-Air  simple nginx deploy % kubectl get services
NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
kubernetes   ClusterIP   10.96.0.1       <none>        443/TCP        16m
nginx        NodePort    10.109.51.199   <none>        80:31791/TCP   42s
rajaragavan@Rajas-MacBook-Air  simple nginx deploy % minikube service nginx
┌───────────┬───────┬─────────────┬───────────────────────────┐
│ NAMESPACE │ NAME  │ TARGET PORT │            URL            │
├───────────┼───────┼─────────────┼───────────────────────────┤
│ default   │ nginx │ 80          │ http://192.168.49.2:31791 │
└───────────┴───────┴─────────────┴───────────────────────────┘
🔗  Starting tunnel for service nginx.
┌───────────┬───────┬─────────────┬────────────────────────┐
│ NAMESPACE │ NAME  │ TARGET PORT │          URL           │
├───────────┼───────┼─────────────┼────────────────────────┤
│ default   │ nginx │             │ http://127.0.0.1:54114 │
└───────────┴───────┴─────────────┴────────────────────────┘
🎉  Opening service default/nginx in default browser...
❗  Because you are using a Docker driver on darwin, the terminal needs to be open to run it.






**PODS**

------------------------------------------------------------------------------
creating the pods as three copies uisng the replicas 
rajaragavan@Rajas-MacBook-Air  simple nginx deploy % kubectl scale deployment nginx --repli
cas=3
deployment.apps/nginx scaled
------------------------------------------------------------------------------

-------------------------------------------------------------------------------
to check the pods are created 
kubectl get pods 
NAME                     READY   STATUS    RESTARTS   AGE
nginx-56c45fd5ff-59z7v   1/1     Running   0          77s
nginx-56c45fd5ff-b4hj9   1/1     Running   0          35m
nginx-56c45fd5ff-v6phk   1/1     Running   0          77s
----------------------------------------------------------------------------------


-----------------------------------------------------------------------------------
#When ever i delete the pods the kubernetes actomatically detect the pod and create new one because we using the replicaset#

now i am deleting the one pod 
rajaragavan@Rajas-MacBook-Air  simple nginx deploy % kubectl delete pod nginx-56c45fd5ff-59z7v
pod "nginx-56c45fd5ff-59z7v" deleted from default namespace

now i am going to check the avaiable pods 
using the kubectl get pods 
rajaragavan@Rajas-MacBook-Air  simple nginx deploy % kubectl get pods 
NAME                     READY   STATUS    RESTARTS   AGE
nginx-56c45fd5ff-b4hj9   1/1     Running   0          38m
nginx-56c45fd5ff-k9hfc   1/1     Running   0          12s
nginx-56c45fd5ff-v6phk   1/1     Running   0          4m24s


--------------------------------------------------------------------------------
when i am going to delete the all pods , what happen? 
rajaragavan@Rajas-MacBook-Air  simple nginx deploy % kubectl delete pods --all
pod "nginx-56c45fd5ff-b4hj9" deleted from default namespace
pod "nginx-56c45fd5ff-k9hfc" deleted from default namespace
pod "nginx-56c45fd5ff-v6phk" deleted from default namespace

agin i am going to check the pods 
kubectl get pods 
rajaragavan@Rajas-MacBook-Air  simple nginx deploy % kubectl get pods         
NAME                     READY   STATUS    RESTARTS   AGE
nginx-56c45fd5ff-6rm8x   1/1     Running   0          35s
nginx-56c45fd5ff-m78t2   1/1     Running   0          35s
nginx-56c45fd5ff-m7r2z   1/1     Running   0          35s

- THIS IS THE USE OF REPLICASET IN KUBENETES 
WHAT HAPPEING HERE MEANS ---- UISNG THE REPLICA SET , IF ONE POD AS CRASHED ARE DELETED THE KUBERNETES ACTOMATICALLY DETECT THE MISSING PODS AND CREATE A NEW PODS 
"Therefore the kubenetes is called as self healing system"
-----------------------------------------------------------------------------------