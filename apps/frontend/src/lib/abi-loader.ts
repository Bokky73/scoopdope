/**
 * ABI Loader — Frontend (Next.js / browser-compatible)
 *
 * Loads Soroban contract ABI definitions at runtime. Uses dynamic import() so
 * the JSON is included in the Next.js bundle and works both server-side and
 * in the browser.
 *
 * Usage:
 *   import { loadAbi, getFunction } from '@/lib/abi-loader';
 *
 *   const abi = await loadAbi('analytics');
 *   const fn  = await getFunction('token', 'mint_reward');
 */

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

export type KnownContract = 'analytics' | 'certificate' | 'token' | 'shared';

// ─── Cache ────────────────────────────────────────────────────────────────────

const _cache = new Map<string, ContractAbi>();

// ─── Schema validation ────────────────────────────────────────────────────────

function validateAbi(raw: unknown, contractName: string): ContractAbi {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error(`ABI for "${contractName}" is not a valid object`);
  }

  const abi = raw as Record<string, unknown>;
  const required = ['contract_name', 'version', 'network', 'functions', 'types', 'events'];
  for (const key of required) {
    if (!(key in abi)) {
      throw new Error(`ABI for "${contractName}" is missing required field: "${key}"`);
    }
  }

  if (!Array.isArray(abi.functions)) {
    throw new Error(`ABI for "${contractName}": "functions" must be an array`);
  }

  return abi as unknown as ContractAbi;
}

// ─── Loader ───────────────────────────────────────────────────────────────────

/**
 * Dynamically load the ABI JSON for a named contract.
 *
 * The result is cached after the first call. Pass `forceReload = true` to bypass
 * the cache (useful in test/dev hot-reload scenarios).
 *
 * @param contractName - One of: "analytics" | "certificate" | "token" | "shared"
 */
export async function loadAbi(
  contractName: KnownContract,
  forceReload = false
): Promise<ContractAbi> {
  if (!forceReload && _cache.has(contractName)) {
    return _cache.get(contractName)!;
  }

  let raw: unknown;

  try {
    // Statically analyzable dynamic imports so bundlers can include these files.
    switch (contractName) {
      case 'analytics':
        raw = (await import('../../../contracts/abis/analytics.json')).default;
        break;
      case 'certificate':
        raw = (await import('../../../contracts/abis/certificate.json')).default;
        break;
      case 'token':
        raw = (await import('../../../contracts/abis/token.json')).default;
        break;
      case 'shared':
        raw = (await import('../../../contracts/abis/shared.json')).default;
        break;
      default:
        throw new Error(`Unknown contract: "${contractName}"`);
    }
  } catch (err: any) {
    throw new Error(
      `Failed to load ABI for "${contractName}": ${err.message}. ` +
        `Ensure the ABI files exist in contracts/abis/ and the build is up to date.`
    );
  }

  const abi = validateAbi(raw, contractName);
  _cache.set(contractName, abi);
  return abi;
}

/**
 * Load all known contract ABIs in parallel and return them as a map.
 */
export async function loadAllAbis(): Promise<Map<KnownContract, ContractAbi>> {
  const contracts: KnownContract[] = ['analytics', 'certificate', 'token', 'shared'];
  const entries = await Promise.all(
    contracts.map(async (name) => [name, await loadAbi(name)] as const)
  );
  return new Map(entries);
}

/**
 * Look up a specific function definition within a contract ABI.
 *
 * @param contractName - The contract to search.
 * @param functionName - The exact function name.
 * @throws Error if the function is not found.
 */
export async function getFunction(
  contractName: KnownContract,
  functionName: string
): Promise<AbiFunction> {
  const abi = await loadAbi(contractName);
  const fn = abi.functions.find((f) => f.name === functionName);
  if (!fn) {
    throw new Error(
      `Function "${functionName}" not found in contract "${contractName}". ` +
        `Available: ${abi.functions.map((f) => f.name).join(', ')}`
    );
  }
  return fn;
}

/**
 * Return all function names for a contract.
 */
export async function getFunctionNames(contractName: KnownContract): Promise<string[]> {
  const abi = await loadAbi(contractName);
  return abi.functions.map((f) => f.name);
}

/**
 * Clear the ABI cache (useful in tests and hot-reload scenarios).
 */
export function clearAbiCache(): void {
  _cache.clear();
}
