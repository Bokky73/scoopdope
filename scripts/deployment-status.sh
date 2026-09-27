#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# Deployment Status Script
# ============================================================================
# View deployment history, status, and contract IDs.
#
# Usage:
#   ./scripts/deployment-status.sh              # Show all deployments
#   ./scripts/deployment-status.sh testnet      # Show testnet deployments
#   ./scripts/deployment-status.sh history      # Show deployment history
#   ./scripts/deployment-status.sh history 20   # Show last 20 deployments
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source helper functions
source "${SCRIPT_DIR}/deployment-helpers.sh"

# ============================================================================
# Main Execution
# ============================================================================

main() {
    local command="${1:-status}"
    local network="${2:-}"
    local limit="${3:-10}"
    
    case "$command" in
        testnet)
            show_deployment_status "testnet"
            ;;
        mainnet)
            show_deployment_status "mainnet"
            ;;
        history)
            echo ""
            echo "Deployment History (last $limit):"
            echo ""
            if [ -z "$network" ]; then
                view_deployment_history "" "$limit"
            else
                view_deployment_history "$network" "$limit"
            fi
            ;;
        list|contracts)
            echo ""
            list_deployments "$network"
            ;;
        status|"")
            show_deployment_status "testnet"
            echo ""
            show_deployment_status "mainnet"
            ;;
        *)
            cat << EOF
${BLUE}Deployment Status Tool${NC}

${YELLOW}Usage:${NC}
  ./scripts/deployment-status.sh              # Show all deployments
  ./scripts/deployment-status.sh testnet      # Show testnet status
  ./scripts/deployment-status.sh mainnet      # Show mainnet status
  ./scripts/deployment-status.sh history [N]  # Show deployment history

${YELLOW}Commands:${NC}
  status     - Show status for both networks (default)
  testnet    - Show testnet deployments
  mainnet    - Show mainnet deployments
  history    - Show deployment history (default: last 10)
  list       - List all deployed contracts

${YELLOW}Examples:${NC}
  ./scripts/deployment-status.sh
  ./scripts/deployment-status.sh mainnet
  ./scripts/deployment-status.sh history 20

EOF
            exit 1
            ;;
    esac
}

main "$@"
