#!/bin/bash
set -euo pipefail

# ============================================
# Product Catalog Deployment Script
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="${ENVIRONMENT:-development}"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

# ============================================
# Helper Functions
# ============================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

show_usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS] COMMAND

Product Catalog Deployment Script

Commands:
    build           Build Docker images
    push            Push images to registry
    deploy          Deploy to environment
    start           Start local development
    stop            Stop local services
    logs            View service logs
    status          Check service status
    clean           Clean up resources

Options:
    -e, --environment   Environment (development|staging|production)
    -r, --registry      Docker registry URL
    -t, --tag           Image tag (default: latest)
    -h, --help          Show this help message

Examples:
    ./deploy.sh build
    ./deploy.sh -e staging deploy
    ./deploy.sh -r ghcr.io/user/repo -t v1.0.0 push
EOF
}

# ============================================
# Commands
# ============================================

cmd_build() {
    log_info "Building Docker images..."
    
    cd "$PROJECT_ROOT"
    
    log_info "Building API image..."
    docker build -t product-catalog-api:${IMAGE_TAG} ./server/ProductCatalog.Api
    
    log_info "Building Client image..."
    docker build -t product-catalog-client:${IMAGE_TAG} ./client
    
    log_success "Docker images built successfully!"
}

cmd_push() {
    if [[ -z "$DOCKER_REGISTRY" ]]; then
        log_error "Docker registry not specified. Use -r or --registry option."
    fi
    
    log_info "Pushing images to ${DOCKER_REGISTRY}..."
    
    # Tag images
    docker tag product-catalog-api:${IMAGE_TAG} ${DOCKER_REGISTRY}/product-catalog-api:${IMAGE_TAG}
    docker tag product-catalog-client:${IMAGE_TAG} ${DOCKER_REGISTRY}/product-catalog-client:${IMAGE_TAG}
    
    # Push images
    docker push ${DOCKER_REGISTRY}/product-catalog-api:${IMAGE_TAG}
    docker push ${DOCKER_REGISTRY}/product-catalog-client:${IMAGE_TAG}
    
    log_success "Images pushed successfully!"
}

cmd_deploy() {
    log_info "Deploying to ${ENVIRONMENT} environment..."
    
    case "$ENVIRONMENT" in
        development)
            cmd_start
            ;;
        staging|production)
            deploy_kubernetes
            ;;
        *)
            log_error "Unknown environment: $ENVIRONMENT"
            ;;
    esac
}

deploy_kubernetes() {
    log_info "Deploying to Kubernetes (${ENVIRONMENT})..."
    
    # Check for kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
    fi
    
    # Check for helm
    if ! command -v helm &> /dev/null; then
        log_error "helm is not installed"
    fi
    
    VALUES_FILE="$PROJECT_ROOT/helm/values-${ENVIRONMENT}.yaml"
    
    if [[ ! -f "$VALUES_FILE" ]]; then
        log_warning "Values file not found: $VALUES_FILE"
        log_info "Using default values..."
        VALUES_FILE=""
    fi
    
    HELM_CMD="helm upgrade --install product-catalog $PROJECT_ROOT/helm/product-catalog"
    
    if [[ -n "$VALUES_FILE" ]]; then
        HELM_CMD="$HELM_CMD -f $VALUES_FILE"
    fi
    
    HELM_CMD="$HELM_CMD --set image.tag=${IMAGE_TAG}"
    
    log_info "Running: $HELM_CMD"
    eval "$HELM_CMD"
    
    log_success "Deployment complete!"
}

cmd_start() {
    log_info "Starting local development environment..."
    
    cd "$PROJECT_ROOT"
    docker compose up -d
    
    log_success "Services started!"
    log_info "API: http://localhost:5000"
    log_info "Client: http://localhost:4200"
}

cmd_stop() {
    log_info "Stopping services..."
    
    cd "$PROJECT_ROOT"
    docker compose down
    
    log_success "Services stopped!"
}

cmd_logs() {
    cd "$PROJECT_ROOT"
    docker compose logs -f
}

cmd_status() {
    log_info "Checking service status..."
    
    cd "$PROJECT_ROOT"
    docker compose ps
    
    echo ""
    log_info "Health checks:"
    
    # Check API health
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        log_success "API: Healthy"
    else
        log_warning "API: Not responding"
    fi
    
    # Check Client
    if curl -s http://localhost:4200 > /dev/null 2>&1; then
        log_success "Client: Healthy"
    else
        log_warning "Client: Not responding"
    fi
}

cmd_clean() {
    log_warning "This will remove all Docker resources for this project."
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cleaning up..."
        
        cd "$PROJECT_ROOT"
        docker compose down -v --rmi local
        
        log_success "Cleanup complete!"
    else
        log_info "Cleanup cancelled."
    fi
}

# ============================================
# Main
# ============================================

main() {
    # Parse options
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -r|--registry)
                DOCKER_REGISTRY="$2"
                shift 2
                ;;
            -t|--tag)
                IMAGE_TAG="$2"
                shift 2
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            build|push|deploy|start|stop|logs|status|clean)
                COMMAND="$1"
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                ;;
        esac
    done
    
    if [[ -z "${COMMAND:-}" ]]; then
        show_usage
        exit 1
    fi
    
    # Execute command
    case "$COMMAND" in
        build)
            cmd_build
            ;;
        push)
            cmd_push
            ;;
        deploy)
            cmd_deploy
            ;;
        start)
            cmd_start
            ;;
        stop)
            cmd_stop
            ;;
        logs)
            cmd_logs
            ;;
        status)
            cmd_status
            ;;
        clean)
            cmd_clean
            ;;
    esac
}

main "$@"
