#!/bin/bash
# Quick setup script for Kubernetes deployment

set -e

echo "🐑 Shepherd Architecture - K8s Setup"
echo "====================================="

# Check prerequisites
command -v kubectl >/dev/null 2>&1 || { echo "❌ kubectl is required but not installed. Aborting." >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ docker is required but not installed. Aborting." >&2; exit 1; }

# Build Docker image
echo "📦 Building Docker image..."
docker build -t shepherd-architecture:latest ..

# Apply configurations
echo "🔧 Applying K8s configurations..."
kubectl apply -f config.yaml
kubectl apply -f databases.yaml
kubectl apply -f deployment.yaml

# Wait for pods to be ready
echo "⏳ Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=mongodb --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis --timeout=120s
kubectl wait --for=condition=ready pod -l app=shepherd-api --timeout=120s

echo "✅ Shepherd Architecture deployed successfully!"
echo ""
echo "📋 Useful commands:"
echo "   kubectl get pods"
echo "   kubectl logs -f deployment/shepherd-api"
echo "   kubectl port-forward svc/shepherd-api-service 8080:80"
echo ""
echo "🌐 Access the API at: http://localhost:8080"
echo "🌐 Access the console at: http://localhost:8080/console.html"
