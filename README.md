## NOTE:Works only on arm based devices,minor changes to be made for other configurations
## for docker image pull from shreyaspai77/xyz:latest
```
curl localhost:8081/fibonacci \
    -H "Content-Type: application/json" \
    -d '{"number": 10}'

> Fibonacci number is 89!
```
```
curl localhost:8081/fibonacci \
    -H "Content-Type: application/json" \
    -d '{"number": 20}'
> Fibonacci number is 10946!
```
```
curl localhost:8081/metrics
```
```
> \# HELP http_requests_total Total number of http requests  
> \# TYPE http_requests_total counter  
> \# http_requests_total{method="POST"} 2
```
## 3. Create Namespaces in Kubernetes
- Create `demo` and `monitoring` namespaces
```
kubectl apply -f 1-namespaces
```
> namespace/demo created  
> namespace/monitoring created

## 4. Create Prometheus Operator CRDs
- Create Prometheus CRDs and RBAC
```
kubectl apply -f 2-prometheus-operator-crd
```
> clusterrole.rbac.authorization.k8s.io/prometheus-crd-view created  
> clusterrole.rbac.authorization.k8s.io/prometheus-crd-edit created  
> customresourcedefinition.apiextensions.k8s.io/alertmanagerconfigs.monitoring.coreos.com created  
> customresourcedefinition.apiextensions.k8s.io/alertmanagers.monitoring.coreos.com created  
> customresourcedefinition.apiextensions.k8s.io/podmonitors.monitoring.coreos.com created  
> customresourcedefinition.apiextensions.k8s.io/probes.monitoring.coreos.com created  
> customresourcedefinition.apiextensions.k8s.io/prometheuses.monitoring.coreos.com created  
> customresourcedefinition.apiextensions.k8s.io/prometheusrules.monitoring.coreos.com created  
> customresourcedefinition.apiextensions.k8s.io/servicemonitors.monitoring.coreos.com created  
> customresourcedefinition.apiextensions.k8s.io/thanosrulers.monitoring.coreos.com created  

## 5. Deploy Prometheus Operator on Kubernetes
```
kubectl apply -f 3-prometheus-operator
```
> serviceaccount/prometheus-operator created  
> clusterrole.rbac.authorization.k8s.io/prometheus-operator created  
> clusterrolebinding.rbac.authorization.k8s.io/prometheus-operator created  
> deployment.apps/prometheus-operator created  
> service/prometheus-operator created  
```
kubectl get pods -n monitoring
```
> NAME                                   READY   STATUS    RESTARTS   AGE  
prometheus-operator-585f487768-745xp   1/1     Running   0          11m  
```
kubectl logs -l app.kubernetes.io/name=prometheus-operator -f -n monitoring
```
> level=info ts=2021-06-27T01:44:00.696399754Z caller=operator.go:355 component=prometheusoperator msg="successfully synced all caches"  
> level=info ts=2021-06-27T01:44:00.702534377Z caller=operator.go:267 component=thanosoperator msg="successfully synced all caches"  
> level=info ts=2021-06-27T01:44:00.79632208Z caller=operator.go:287 component=alertmanageroperator msg="successfully synced all caches"  

## 6. Deploy Prometheus on Kubernetes
```
kubectl apply -f 4-prometheus
```
> serviceaccount/prometheus created  
> clusterrole.rbac.authorization.k8s.io/prometheus created  
> clusterrolebinding.rbac.authorization.k8s.io/prometheus created  
> prometheus.monitoring.coreos.com/prometheus created  
```
kubectl get pods -n monitoring
```
> NAME                                   READY   STATUS    RESTARTS   AGE  
prometheus-operator-585f487768-745xp   1/1     Running   0          11m  
prometheus-prometheus-0                2/2     Running   1          5m17s  
```
kubectl logs -l app.kubernetes.io/instance=prometheus -f -n monitoring
```
> level=info ts=2021-06-27T01:50:04.190Z caller=main.go:995 msg="Completed loading of configuration file" filename=/etc/prometheus/config_out/prometheus.env.yaml totalDuration=507.082µs remote_storage=3.213µs web_handler=388ns query_engine=1.274µs scrape=74.372µs scrape_sd=3.853µs notify=996ns notify_sd=1.554µs rules=34.528µs  

## 7. Deploy Sample Express App
- Open Prometheus Target page
```
kubectl port-forward svc/prometheus-operated 9090 -n monitoring
```
> Forwarding from 127.0.0.1:9090 -> 9090  
> Forwarding from [::1]:9090 -> 9090  
- Go to http://localhost:9090
- Use `http` to query Prometheus (empty)

```
kubectl apply -f 5-demo
```
> deployment.apps/express created  
> service/express created  
> servicemonitor.monitoring.coreos.com/express created  
> horizontalpodautoscaler.autoscaling/http created  

- Go back to `http://localhost:9090` target page
- Port forward express app
```
kubectl port-forward svc/express 8081 -n demo
```
- Use curl to hit fibonacci enpont twice
```
curl localhost:8081/fibonacci \
    -H "Content-Type: application/json" \
    -d '{"number": 10}'
```
> Fibonacci number is 89!  
- Use `http` to query Prometheus
- Get hpa
```
kubectl get hpa -n demo
```
> <unknown>/500m  
```
kubectl describe hpa http -n demo
```
```
kubectl get --raw /apis/cusxtom.metrics.k8s.io/v1beta1 | jq
```
> Error from server (NotFound): the server could not find the requested resource 

## Deploy Prometheus Adapter
```
kubectl apply -f 6-prometheus-adapter/0-adapter
kubectl apply -f 6-prometheus-adapter/1-custom-metrics
kubectl apply -f 6-prometheus-adapter/2-resource-metrics
```

- Open 3 terminal tabs
```
watch -n 1 -t kubectl get hpa -n demo
```
```
watch -n 1 -t kubectl get pods -n demo
```
```
kubectl describe hpa http -n demo

kubectl get --raw /apis/custom.metrics.k8s.io/v1beta1 | jq
```

- Deploy Prometheus adapter

```
kubectl get apiservice
```
## 8.Generate http load 
``` sh
  for ((i = 0; i < 1000; i++)); do                                                       
   curl localhost:8081/fibonacci \
    -H "Content-Type: application/json" \
    -d '{"number": 20}'
done
```
- keep seeing the terminals opened
  - after running the curl requests, initially average being 0 slowly increases and crosses 9000
## 9.Generate CPU load
```sh 
    curl localhost:8081/fibonacci \              
    -H "Content-Type: application/json" \
    -d '{"number": 100}'
```
- observe pod increase
