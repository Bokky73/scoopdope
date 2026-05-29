#!/usr/bin/env bash
set -euo pipefail

echo "Building scoopdope smart contracts..."

# Loop over all contracts in contracts/ directory
for contract_dir in contracts/*/; do
    contract_name=$(basename "$contract_dir")
    
    # Skip if not a Rust project
    if [ ! -f "$contract_dir/Cargo.toml" ]; then
        continue
    fi
    
    echo "Building $contract_name..."
    cargo build --release --target wasm32-unknown-unknown --manifest-path "$contract_dir/Cargo.toml"
done

echo ""
echo "Build complete. WASM files and sizes:"
find target/wasm32-unknown-unknown/release -name "*.wasm" -type f ! -path "*/deps/*" | while read wasm_file; do
    size=$(du -h "$wasm_file" | cut -f1)
    echo "  $wasm_file ($size)"
done
