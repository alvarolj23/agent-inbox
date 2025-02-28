#!/bin/bash

# Exit on error
set -e

# Azure Container Registry credentials and configuration
ACR_NAME="acrstockanalysis"  # Use your ACR name
RESOURCE_GROUP="rg-crypto-analysis"  # Use your resource group
LOCATION="West Europe"

# Application version and container name
APP="agent-inbox:v1.0.5"

# Set Azure subscription
echo "Setting Azure subscription..."
az account set --subscription "Visual Studio Enterprise Subscription – MPN"

# Get ACR server URL
SERVER="${ACR_NAME}.azurecr.io"
echo "Using ACR server: ${SERVER}"

# Login to Azure Container Registry
echo "Logging into Azure Container Registry..."
az acr login -n ${ACR_NAME}

# Set yarn network timeout and retries
export YARN_NETWORK_TIMEOUT=300000
export YARN_NETWORK_CONCURRENCY=1

# Build and push for amd64 (Azure Web App uses amd64)
echo "Building and pushing amd64 image..."
docker buildx build \
  --platform linux/amd64 \
  --build-arg YARN_NETWORK_TIMEOUT=300000 \
  --build-arg YARN_NETWORK_CONCURRENCY=1 \
  --tag "${SERVER}/${APP}" \
  --push \
  .

echo "Build and push completed successfully!"

# Clean up
echo "Cleaning up..."
docker buildx rm mybuilder 