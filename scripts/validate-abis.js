#!/usr/bin/env node
/**
 * ABI Validation Script (#875)
 *
 * Validates that all ABI JSON files in /contracts/abis/ conform to the expected
 * schema and are internally consistent. Run this in CI and before any release.
 *
 * Usage:
 *   node scripts/validate-abis.js
 *   # or via npm workspace:
 *   npm run abi:validate --workspace=apps/backend
 *
 * Exit code 0  — all ABIs valid
 * Exit code 1  — one or more ABIs failed validation
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────

const REPO_ROOT  = path.resolve(__dirname, '..');
const ABI_DIR    = path.join(REPO_ROOT, 'contracts', 'abis');
const INDEX_FILE = path.join(ABI_DIR, 'index.json');

/** Soroban primitive types considered valid. */
const PRIMITIVE_TYPES = new Set([
  'address', 'bool',
  'i32', 'i64', 'i128', 'i256',
  'u32', 'u64', 'u128', 'u256',
  'string', 'symbol', 'bytes', 'bytesN',
  'void',
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

let errors   = 0;
let warnings = 0;

function pass(msg)  { console.log(`  ✅  ${msg}`); }
function warn(msg)  { console.warn(`  ⚠️   ${msg}`); warnings++; }
function fail(msg)  { console.error(`  ❌  ${msg}`); errors++; }

function isValidType(typeStr, definedTypes) {
  if (!typeStr) return false;
  // Vec<T>
  const vecMatch = typeStr.match(/^Vec<(.+)>$/);
  if (vecMatch) return isValidType(vecMatch[1], definedTypes);
  // Option<T>
  const optMatch = typeStr.match(/^Option<(.+)>$/);
  if (optMatch) return isValidType(optMatch[1], definedTypes);
  // Map<K,V>
  const mapMatch = typeStr.match(/^Map<(.+),\s*(.+)>$/);
  if (mapMatch) return isValidType(mapMatch[1], definedTypes) && isValidType(mapMatch[2], definedTypes);
  return PRIMITIVE_TYPES.has(typeStr) || definedTypes.has(typeStr);
}

// ─── Validators ───────────────────────────────────────────────────────────────

function validateIndex(indexPath) {
  console.log('\n📋  Validating index.json …');

  if (!fs.existsSync(indexPath)) {
    fail(`index.json not found at: ${indexPath}`);
    return null;
  }

  let index;
  try {
    index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  } catch (e) {
    fail(`index.json is not valid JSON: ${e.message}`);
    return null;
  }

  if (!index.version)   fail('index.json missing "version"');
  if (!Array.isArray(index.contracts)) {
    fail('index.json "contracts" must be an array');
    return null;
  }

  for (const entry of index.contracts) {
    if (!entry.name) fail('Contract entry missing "name"');
    if (!entry.file) fail(`Contract "${entry.name}" missing "file"`);
    else {
      const abiPath = path.join(ABI_DIR, entry.file);
      if (!fs.existsSync(abiPath)) {
        fail(`File listed in index not found: ${entry.file}`);
      }
    }
  }

  pass('index.json structure valid');
  return index;
}

function validateAbiFile(contractName, filePath) {
  console.log(`\n📄  Validating ${contractName} (${path.basename(filePath)}) …`);

  if (!fs.existsSync(filePath)) {
    fail(`File not found: ${filePath}`);
    return;
  }

  // ── Parse ──────────────────────────────────────────────────────────────────
  let abi;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    abi = JSON.parse(raw);
  } catch (e) {
    fail(`Not valid JSON: ${e.message}`);
    return;
  }

  // ── Top-level fields ───────────────────────────────────────────────────────
  const required = ['contract_name', 'version', 'network', 'functions', 'types', 'events'];
  for (const key of required) {
    if (!(key in abi)) fail(`Missing required top-level field: "${key}"`);
  }

  if (abi.contract_name !== contractName) {
    fail(`contract_name "${abi.contract_name}" does not match expected "${contractName}"`);
  }

  if (abi.network !== 'stellar/soroban') {
    warn(`network is "${abi.network}", expected "stellar/soroban"`);
  }

  if (!abi.version || !/^\d+\.\d+\.\d+$/.test(abi.version)) {
    fail(`version "${abi.version}" is not a valid semver string`);
  }

  // ── Types ──────────────────────────────────────────────────────────────────
  const definedTypes = new Set(Object.keys(abi.types || {}));

  if (typeof abi.types !== 'object' || Array.isArray(abi.types)) {
    fail('"types" must be an object');
  } else {
    for (const [typeName, typeDef] of Object.entries(abi.types)) {
      if (typeof typeDef !== 'object' || typeDef === null) {
        fail(`Type "${typeName}" must be an object`);
        continue;
      }
      const td = /** @type {any} */ (typeDef);
      if (!td.fields && !td.enum) {
        fail(`Type "${typeName}" must have either "fields" or "enum"`);
        continue;
      }
      if (td.fields) {
        if (!Array.isArray(td.fields)) {
          fail(`Type "${typeName}" fields must be an array`);
        } else {
          for (const field of td.fields) {
            if (!field.name) fail(`Type "${typeName}" has a field without a name`);
            if (!field.type) fail(`Type "${typeName}" field "${field.name}" missing "type"`);
            else if (!isValidType(field.type, definedTypes)) {
              warn(`Type "${typeName}" field "${field.name}" uses unrecognised type: "${field.type}"`);
            }
          }
        }
      }
      if (td.enum) {
        if (!Array.isArray(td.enum) || td.enum.some((v) => typeof v !== 'string')) {
          fail(`Type "${typeName}" enum must be an array of strings`);
        }
      }
    }
    pass(`types section: ${definedTypes.size} type(s) defined`);
  }

  // ── Functions ──────────────────────────────────────────────────────────────
  if (!Array.isArray(abi.functions)) {
    fail('"functions" must be an array');
  } else {
    const fnNames = new Set();
    for (const fn of abi.functions) {
      if (typeof fn !== 'object' || fn === null) { fail('Each function must be an object'); continue; }
      if (!fn.name || typeof fn.name !== 'string') { fail('Function missing "name" string'); continue; }
      if (fnNames.has(fn.name)) fail(`Duplicate function name: "${fn.name}"`);
      fnNames.add(fn.name);

      if (!Array.isArray(fn.inputs))  fail(`Function "${fn.name}" missing "inputs" array`);
      if (!Array.isArray(fn.outputs)) fail(`Function "${fn.name}" missing "outputs" array`);

      for (const input of (fn.inputs || [])) {
        if (!input.name) fail(`Function "${fn.name}" has an input without a name`);
        if (!input.type) fail(`Function "${fn.name}" input "${input.name}" missing "type"`);
        else if (!isValidType(input.type, definedTypes)) {
          warn(`Function "${fn.name}" input "${input.name}" uses unrecognised type: "${input.type}"`);
        }
      }
      for (const output of (fn.outputs || [])) {
        if (!output.type) fail(`Function "${fn.name}" has an output without "type"`);
        else if (!isValidType(output.type, definedTypes)) {
          warn(`Function "${fn.name}" output uses unrecognised type: "${output.type}"`);
        }
      }
    }
    pass(`functions section: ${fnNames.size} function(s) defined`);
  }

  // ── Events ─────────────────────────────────────────────────────────────────
  if (!Array.isArray(abi.events)) {
    fail('"events" must be an array');
  } else {
    for (const evt of abi.events) {
      if (!evt.name) fail('Event missing "name"');
      if (!Array.isArray(evt.topics)) fail(`Event "${evt.name}" missing "topics" array`);
    }
    if (abi.events.length > 0) pass(`events section: ${abi.events.length} event(s) defined`);
    else pass('events section: no events (ok)');
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  scoopdope — Contract ABI Validator');
  console.log(`  ABI directory: ${ABI_DIR}`);
  console.log('═══════════════════════════════════════════════════════');

  if (!fs.existsSync(ABI_DIR)) {
    console.error(`\n❌  ABI directory not found: ${ABI_DIR}`);
    console.error('   Run the ABI export process first.');
    process.exit(1);
  }

  const index = validateIndex(INDEX_FILE);

  // Validate every contract listed in the index
  if (index && Array.isArray(index.contracts)) {
    for (const { name, file } of index.contracts) {
      validateAbiFile(name, path.join(ABI_DIR, file));
    }
  }

  // Also check for any JSON files in the directory not listed in the index
  const indexedFiles = new Set(
    (index?.contracts || []).map((c) => c.file)
  );
  for (const file of fs.readdirSync(ABI_DIR)) {
    if (file === 'index.json' || !file.endsWith('.json')) continue;
    if (!indexedFiles.has(file)) {
      warn(`File "${file}" exists in abis/ but is not listed in index.json`);
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  if (errors === 0 && warnings === 0) {
    console.log('  ✅  All ABIs are valid. No issues found.');
  } else if (errors === 0) {
    console.log(`  ⚠️   All ABIs valid — ${warnings} warning(s). Review above.`);
  } else {
    console.log(`  ❌  Validation FAILED — ${errors} error(s), ${warnings} warning(s).`);
  }
  console.log('═══════════════════════════════════════════════════════\n');

  process.exit(errors > 0 ? 1 : 0);
}

main();
