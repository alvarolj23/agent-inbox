#!/bin/bash

# Exit on error
set -e

# Azure Container Registry credentials and configuration
ACR_NAME="acrstockanalysis"  # Use your ACR name
RESOURCE_GROUP="rg-crypto-analysis"  # Use your resource group
LOCATION="West Europe"

# Application version and container name
APP="agent-inbox:v1.0.0"

# Set Azure subscription
echo "Setting Azure subscription..."
az account set --subscription "Visual Studio Enterprise Subscription – MPN"

# Get ACR server URL
SERVER="${ACR_NAME}.azurecr.io"
echo "Using ACR server: ${SERVER}"

# Login to Azure Container Registry
echo "Logging into Azure Container Registry..."
az acr login -n ${ACR_NAME}

# Remove existing builder if exists
echo "Cleaning up existing builder..."
docker buildx rm mybuilder || true

# Create and use a new builder instance with better caching
echo "Setting up Docker buildx..."
docker buildx create --name mybuilder \
  --driver docker-container \
  --driver-opt network=host \
  --use \
  --bootstrap

# Set BuildKit options for better performance
export DOCKER_BUILDKIT=1
export BUILDKIT_STEP_LOG_MAX_SIZE=10485760
export BUILDKIT_STEP_LOG_MAX_SPEED=10485760

# Build and push multi-architecture image directly
echo "Building and pushing multi-architecture image..."
docker buildx build \
  --platform linux/amd64 \
  --cache-from type=registry,ref=${SERVER}/${APP} \
  --cache-to type=inline \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --tag "${SERVER}/${APP}" \
  --push \
  .

# Verify the push
echo "Verifying image in ACR..."
az acr repository show-tags \
    --name ${ACR_NAME} \
    --repository agent-inbox \
    --orderby time_desc \
    --output table

echo "Build and push completed successfully!" 