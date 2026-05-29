#!/bin/bash
set -e

echo "Installing Chaos Mesh..."

# Add Chaos Mesh Helm repository
helm repo add chaos-mesh https://charts.chaos-mesh.org
helm repo update

# Create namespace
kubectl create namespace chaos-mesh --dry-run=client -o yaml | kubectl apply -f -

# Install Chaos Mesh
helm install chaos-mesh chaos-mesh/chaos-mesh \
  --namespace chaos-mesh \
  --set chaosDaemon.privileged=true \
  --set dashboard.enabled=true \
  --set dashboard.service.type=LoadBalancer

echo "Chaos Mesh installed successfully!"
echo "Dashboard available at: http://localhost:2333"
