#!/bin/bash

# Apply namespace configuration
kubectl create namespace my-grafana 
kubectl apply -f grafana.yaml --namespace=my-grafana
echo "Creating namespaces..."
kubectl apply -f 1-namespaces
echo "Namespaces created."

# Apply Prometheus Operator CRDs
echo "Creating Prometheus Operator CRDs..."
kubectl apply -f 2-prometheus-operator-crd
echo "Prometheus Operator CRDs created."

# Deploy Prometheus Operator
echo "Deploying Prometheus Operator..."
kubectl apply -f 3-prometheus-operator
echo "Prometheus Operator deployed."

# Check Prometheus Operator pod status
# echo "Checking Prometheus Operator pod status..."
# kubectl get pods -n monitoring
# kubectl logs -l app.kubernetes.io/name=prometheus-operator -f -n monitoring &

# Deploy Prometheus
echo "Deploying Prometheus..."
kubectl apply -f 4-prometheus
echo "Prometheus deployed."

# Check Prometheus pods status
# echo "Checking Prometheus pods status..."
# kubectl get pods -n monitoring
# kubectl logs -l app.kubernetes.io/instance=prometheus -f -n monitoring &

# # Port forward Prometheus service
# echo "Port forwarding Prometheus service..."
# kubectl port-forward svc/prometheus-operated 9090 -n monitoring &

# Deploy Sample Express App
echo "Deploying Sample Express App..."
kubectl apply -f 5-demo
echo "Sample Express App deployed."

# Port forward Express app service
# echo "Port forwarding Express app service..."
# kubectl port-forward svc/express 8081 -n demo &

# Hit Fibonacci endpoint
# echo "Hitting Fibonacci endpoint..."
# curl localhost:8081/fibonacci -H "Content-Type: application/json" -d '{"number": 10}'
# curl localhost:8081/fibonacci -H "Content-Type: application/json" -d '{"number": 10}'

# Query Prometheus for HPA metrics
# echo "Querying Prometheus for HPA metrics..."
# kubectl get hpa -n demo
# kubectl describe hpa http -n demo
# kubectl get --raw /apis/custom.metrics.k8s.io/v1beta1 | jq

# Deploy Prometheus Adapter
echo "Deploying Prometheus Adapter..."
kubectl apply -f 6-prometheus-adapter/0-adapter
kubectl apply -f 6-prometheus-adapter/1-custom-metrics
kubectl apply -f 6-prometheus-adapter/2-resource-metrics
echo "Prometheus Adapter deployed."

# # Open monitoring tabs
# echo "Opening monitoring tabs..."
# gnome-terminal --tab --title="HPA" --command="bash -c 'watch -n 1 -t kubectl get hpa -n demo; exec bash'"
# gnome-terminal --tab --title="Pods" --command="bash -c 'watch -n 1 -t kubectl get pods -n demo; exec bash'"
# gnome-terminal --tab --title="HPA Describe" --command="bash -c 'kubectl describe hpa http -n demo; exec bash'"

# Check APIs
kubectl apply -f 7-cadvisor

echo "Script execution completed."
