#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# Scoopdope Smart Contract Build Script
# ============================================================================
# Builds all or specified Soroban smart contracts to WASM.
#
# Usage:
#   ./scripts/build.sh              # Build all contracts
#   ./scripts/build.sh analytics    # Build specific contract
#
# Arguments:
#   contract (optional): specific contract name to build
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
WASM_TARGET="wasm32-unknown-unknown"
BUILD_PROFILE="release"

# ============================================================================
# Helper Functions
# ============================================================================

log_info() {
    echo -e "${BLUE}ℹ${NC} $*"
}

log_success() {
    echo -e "${GREEN}✓${NC} $*"
}

log_error() {
    echo -e "${RED}✗${NC} $*" >&2
}

print_usage() {
    cat << EOF
${BLUE}Scoopdope Smart Contract Build${NC}

${YELLOW}Usage:${NC}
  ./scripts/build.sh              # Build all contracts
  ./scripts/build.sh <contract>   # Build specific contract

${YELLOW}Examples:${NC}
  ./scripts/build.sh
  ./scripts/build.sh analytics
  ./scripts/build.sh token

${YELLOW}Output:${NC}
  WASM files in: target/wasm32-unknown-unknown/release/

EOF
}

# Get list of contracts to build
get_contracts() {
    local specific_contract="${1:-}"
    
    if [ -n "$specific_contract" ]; then
        # Build specific contract
        local contract_path="${PROJECT_ROOT}/contracts/${specific_contract}"
        if [ ! -d "$contract_path" ] || [ ! -f "$contract_path/Cargo.toml" ]; then
            log_error "Contract not found: $specific_contract"
            echo ""
            echo "Available contracts:"
            ls -1 "${PROJECT_ROOT}/contracts/" | grep -v "^\." | sed 's/^/  - /'
            exit 1
        fi
        echo "$specific_contract"
    else
        # Build all valid contracts
        for contract_dir in "${PROJECT_ROOT}/contracts"/*/; do
            contract_name=$(basename "$contract_dir")
            if [ -f "$contract_dir/Cargo.toml" ]; then
                echo "$contract_name"
            fi
        done
    fi
}

# Build a single contract
build_contract() {
    local contract_name="$1"
    local contract_path="${PROJECT_ROOT}/contracts/${contract_name}"
    local manifest="${contract_path}/Cargo.toml"
    
    log_info "Building: $contract_name"
    
    if ! cargo build \
        --release \
        --target "$WASM_TARGET" \
        --manifest-path "$manifest" 2>&1; then
        log_error "Build failed: $contract_name"
        return 1
    fi
    
    log_success "Built: $contract_name"
}

# Find and display WASM files
display_wasm_files() {
    log_info "Build artifacts:"
    echo ""
    
    local wasm_dir="${PROJECT_ROOT}/target/${WASM_TARGET}/${BUILD_PROFILE}"
    if [ ! -d "$wasm_dir" ]; then
        log_error "Build directory not found: $wasm_dir"
        return 1
    fi
    
    local count=0
    find "$wasm_dir" -maxdepth 1 -name "*.wasm" -type f | sort | while read -r wasm_file; do
        local size
        size=$(du -h "$wasm_file" | cut -f1)
        echo "  $(basename "$wasm_file") ($size)"
        count=$((count + 1))
    done
    
    echo ""
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    local specific_contract="${1:-}"
    
    # Show usage if requested
    if [ "$specific_contract" = "-h" ] || [ "$specific_contract" = "--help" ]; then
        print_usage
        exit 0
    fi
    
    log_info "Scoopdope Smart Contract Build"
    echo ""
    
    # Ensure WASM target is installed
    if ! rustup target list | grep -q "^wasm32-unknown-unknown (installed)"; then
        log_info "Installing Rust wasm32 target..."
        if ! rustup target add wasm32-unknown-unknown; then
            log_error "Failed to install wasm32 target"
            exit 1
        fi
        log_success "wasm32 target installed"
        echo ""
    fi
    
    # Get contracts to build
    local contracts
    contracts=$(get_contracts "$specific_contract")
    
    if [ -z "$contracts" ]; then
        log_error "No contracts found to build"
        exit 1
    fi
    
    # Build each contract
    local failed_builds=()
    while IFS= read -r contract_name; do
        if ! build_contract "$contract_name"; then
            failed_builds+=("$contract_name")
        fi
    done <<< "$contracts"
    
    echo ""
    display_wasm_files
    
    # Report results
    if [ ${#failed_builds[@]} -gt 0 ]; then
        log_error "Build completed with ${#failed_builds[@]} failure(s)"
        printf '%s\n' "${failed_builds[@]}" | sed 's/^/  - /'
        exit 1
    else
        log_success "All builds completed successfully"
    fi
}

main "$@"
