#!/bin/bash
set -euo pipefail

# ============================================
# Product Catalog Build Script
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ============================================
# Build Backend
# ============================================
build_backend() {
    log_info "Building .NET Backend..."
    
    cd "$PROJECT_ROOT/server/ProductCatalog.Api"
    
    dotnet restore
    dotnet build --configuration Release --no-restore
    
    log_success "Backend build completed!"
}

# ============================================
# Build Frontend
# ============================================
build_frontend() {
    log_info "Building Angular Frontend..."
    
    cd "$PROJECT_ROOT/client"
    
    npm ci
    npm run build -- --configuration production
    
    log_success "Frontend build completed!"
}

# ============================================
# Run Tests
# ============================================
run_backend_tests() {
    log_info "Running backend tests..."
    
    cd "$PROJECT_ROOT/server/ProductCatalog.Api"
    
    dotnet test --configuration Release --no-build --verbosity normal
    
    log_success "Backend tests passed!"
}

run_frontend_tests() {
    log_info "Running frontend tests..."
    
    cd "$PROJECT_ROOT/client"
    
    npm run test:ci
    
    log_success "Frontend tests passed!"
}

# ============================================
# Main
# ============================================
main() {
    local command="${1:-all}"
    
    case "$command" in
        backend)
            build_backend
            ;;
        frontend)
            build_frontend
            ;;
        test-backend)
            run_backend_tests
            ;;
        test-frontend)
            run_frontend_tests
            ;;
        test)
            run_backend_tests
            run_frontend_tests
            ;;
        all)
            build_backend
            build_frontend
            ;;
        *)
            echo "Usage: $0 {all|backend|frontend|test|test-backend|test-frontend}"
            exit 1
            ;;
    esac
}

main "$@"
