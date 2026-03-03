# Helm Charts

This directory contains Helm charts for Kubernetes deployment.

## Overview

Helm charts for deploying The Journey application to Kubernetes clusters.

## Prerequisites

- Kubernetes cluster (v1.20+)
- Helm 3.x installed
- kubectl configured

## Usage

### Install

```bash
helm install the-journey ./helm
```

### Upgrade

```bash
helm upgrade the-journey ./helm
```

### Uninstall

```bash
helm uninstall the-journey
```

## Configuration

Customize deployment by modifying `values.yaml`:

```yaml
replicaCount: 1
image:
  repository: the-journey
  tag: latest
  pullPolicy: IfNotPresent
```

## Structure

```
helm/
├── Chart.yaml          # Chart metadata
├── values.yaml         # Default configuration values
├── templates/          # Kubernetes manifest templates
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
└── charts/             # Chart dependencies
```
