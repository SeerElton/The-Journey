# Helm Charts

Kubernetes deployment charts for Product Catalog Management System.

## Charts

### product-catalog

Main application chart containing:
- API service (ASP.NET Core)
- Client service (Angular)
- Ingress configuration
- Service accounts

## Quick Start

```bash
# Install with default values
helm install product-catalog ./product-catalog

# Install with staging values
helm install product-catalog ./product-catalog -f ./product-catalog/values-staging.yaml

# Install with production values
helm install product-catalog ./product-catalog -f ./product-catalog/values-production.yaml
```

## Configuration

See `values.yaml` for all available options.

### Key Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `api.replicaCount` | API replicas | 2 |
| `api.image.tag` | API image tag | latest |
| `client.replicaCount` | Client replicas | 2 |
| `client.image.tag` | Client image tag | latest |
| `ingress.enabled` | Enable ingress | true |
| `ingress.hosts` | Ingress hosts | product-catalog.local |

## Environments

- `values.yaml` - Default/development
- `values-staging.yaml` - Staging environment
- `values-production.yaml` - Production environment
