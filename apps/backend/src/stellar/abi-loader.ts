/**
 * ABI Loader Utility
 *
 * Loads and validates Soroban contract ABI definitions at runtime.
 * ABIs are read once and cached in memory for the lifetime of the process.
 *
 * Usage:
 *   import { loadAbi, getFunction } from './abi-loader';
 *
 *   const analyticsAbi = loadAbi('analytics');
 *   const fn = getFunction('analytics', 'record_progress');
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AbiInput {
  name: string;
  type: string;
  doc?: string;
}

export interface AbiOutput {
  type: string;
  doc?: string;
}

export interface AbiFunction {
  name: string;
  doc?: string;
  inputs: AbiInput[];
  outputs: AbiOutput[];
}

export interface AbiTypeField {
  name: string;
  type: string;
}

export interface AbiType {
  fields?: AbiTypeField[];
  enum?: string[];
}

export interface AbiEvent {
  name: string;
  topics: string[];
  data: { type: string };
}

export interface ContractAbi {
  contract_name: string;
  version: string;
  network: string;
  description?: string;
  functions: AbiFunction[];
  types: Record<string, AbiType>;
  events: AbiEvent[];
}

// ─── Cache ─────────────────────────────────────────────────────────────────

const _cache = new Map<string, ContractAbi>();

// ─── ABI directory ─────────────────────────────────────────────────────────

/**
 * Resolve the absolute path to the /contracts/abis/ directory.
 * Works regardless of where the compiled JS ends up (dist/ etc.)
 * by walking up from __dirname until we find `contracts/`.
 */
function resolveAbiDir(): string {
  // When running from apps/backend/dist the monorepo root is 3 levels up.
  // When running from tests it may be 2 levels up. Walk until found.
  let dir = __dirname;
  for (let i = 0; i < 8; i++) {
    const candidate = path.join(dir, 'contracts', 'abis');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break; // filesystem root
    dir = parent;
  }
  // Fallback: relative to CWD (useful in tests and scripts)
  return path.resolve(process.cwd(), 'contracts', 'abis');
}

let _abiDir: string | null = null;
function getAbiDir(): string {
  if (!_abiDir) _abiDir = resolveAbiDir();
  return _abiDir;
}

// ─── Schema validation ─────────────────────────────────────────────────────

/**
 * Lightweight structural validation of a parsed ABI object.
 * Throws a descriptive error if the ABI does not conform to the expected schema.
 */
function validateAbi(raw: unknown, contractName: string): ContractAbi {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error(`ABI for "${contractName}" is not an object`);
  }

  const abi = raw as Record<string, unknown>;

  const requiredTopLevel = ['contract_name', 'version', 'network', 'functions', 'types', 'events'];
  for (const key of requiredTopLevel) {
    if (!(key in abi)) {
      throw new Error(`ABI for "${contractName}" is missing required field: "${key}"`);
    }
  }

  if (!Array.isArray(abi.functions)) {
    throw new Error(`ABI for "${contractName}": "functions" must be an array`);
  }

  for (const fn of abi.functions as unknown[]) {
    if (typeof fn !== 'object' || fn === null) {
      throw new Error(`ABI for "${contractName}": each function must be an object`);
    }
    const f = fn as Record<string, unknown>;
    if (typeof f.name !== 'string' || !f.name) {
      throw new Error(`ABI for "${contractName}": function missing "name" string field`);
    }
    if (!Array.isArray(f.inputs)) {
      throw new Error(`ABI for "${contractName}": function "${f.name}" missing "inputs" array`);
    }
    if (!Array.isArray(f.outputs)) {
      throw new Error(`ABI for "${contractName}": function "${f.name}" missing "outputs" array`);
    }
  }

  if (!Array.isArray(abi.events)) {
    throw new Error(`ABI for "${contractName}": "events" must be an array`);
  }

  return abi as unknown as ContractAbi;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Load the ABI for a named contract.
 *
 * The result is cached after the first read. Pass `forceReload = true` to bypass
 * the cache (useful in test scenarios that swap ABI files).
 *
 * @param contractName - One of: "analytics" | "certificate" | "token" | "shared"
 * @param forceReload  - Bypass the in-memory cache (default: false)
 */
export function loadAbi(contractName: string, forceReload = false): ContractAbi {
  if (!forceReload && _cache.has(contractName)) {
    return _cache.get(contractName)!;
  }

  const abiPath = path.join(getAbiDir(), `${contractName}.json`);

  if (!fs.existsSync(abiPath)) {
    throw new Error(
      `ABI file not found for contract "${contractName}" at: ${abiPath}. ` +
        `Run the ABI export process: npm run abi:validate`
    );
  }

  let raw: unknown;
  try {
    const content = fs.readFileSync(abiPath, 'utf-8');
    raw = JSON.parse(content);
  } catch (err: any) {
    throw new Error(`Failed to parse ABI for "${contractName}": ${err.message}`);
  }

  const abi = validateAbi(raw, contractName);
  _cache.set(contractName, abi);
  return abi;
}

/**
 * Load all ABIs listed in contracts/abis/index.json and return them as a map.
 */
export function loadAllAbis(): Map<string, ContractAbi> {
  const indexPath = path.join(getAbiDir(), 'index.json');
  if (!fs.existsSync(indexPath)) {
    throw new Error(`ABI index not found at: ${indexPath}`);
  }

  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8')) as {
    contracts: Array<{ name: string }>;
  };

  const result = new Map<string, ContractAbi>();
  for (const { name } of index.contracts) {
    result.set(name, loadAbi(name));
  }
  return result;
}

/**
 * Look up a specific function definition from a contract ABI.
 *
 * @param contractName - The contract to search.
 * @param functionName - The function name to find.
 * @throws Error if contract or function is not found.
 */
export function getFunction(contractName: string, functionName: string): AbiFunction {
  const abi = loadAbi(contractName);
  const fn = abi.functions.find((f) => f.name === functionName);
  if (!fn) {
    throw new Error(
      `Function "${functionName}" not found in ABI for contract "${contractName}". ` +
        `Available functions: ${abi.functions.map((f) => f.name).join(', ')}`
    );
  }
  return fn;
}

/**
 * Return all function names exported by a contract.
 */
export function getFunctionNames(contractName: string): string[] {
  return loadAbi(contractName).functions.map((f) => f.name);
}

/**
 * Clear the ABI cache. Useful in tests.
 */
export function clearAbiCache(): void {
  _cache.clear();
}

// ─── Convenience re-exports ─────────────────────────────────────────────────

export const KNOWN_CONTRACTS = ['analytics', 'certificate', 'token', 'shared'] as const;
export type KnownContract = (typeof KNOWN_CONTRACTS)[number];
