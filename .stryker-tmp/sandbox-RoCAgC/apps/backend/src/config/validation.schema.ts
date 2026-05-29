// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import * as Joi from 'joi';
export const validationSchema = Joi.object(stryMutAct_9fa48("2203") ? {} : (stryCov_9fa48("2203"), {
  // App
  NODE_ENV: Joi.string().valid(stryMutAct_9fa48("2204") ? "" : (stryCov_9fa48("2204"), 'development'), stryMutAct_9fa48("2205") ? "" : (stryCov_9fa48("2205"), 'production'), stryMutAct_9fa48("2206") ? "" : (stryCov_9fa48("2206"), 'test')).default(stryMutAct_9fa48("2207") ? "" : (stryCov_9fa48("2207"), 'development')),
  PORT: Joi.number().default(3000),
  // Database
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  // JWT
  JWT_SECRET: stryMutAct_9fa48("2208") ? Joi.string().max(16).required() : (stryCov_9fa48("2208"), Joi.string().min(16).required()),
  // Redis
  REDIS_URL: Joi.string().uri().required(),
  // Stellar
  STELLAR_NETWORK: Joi.string().valid(stryMutAct_9fa48("2209") ? "" : (stryCov_9fa48("2209"), 'testnet'), stryMutAct_9fa48("2210") ? "" : (stryCov_9fa48("2210"), 'mainnet')).default(stryMutAct_9fa48("2211") ? "" : (stryCov_9fa48("2211"), 'testnet')),
  STELLAR_SECRET_KEY: Joi.string().required(),
  SOROBAN_RPC_URL: Joi.string().uri().default(stryMutAct_9fa48("2212") ? "" : (stryCov_9fa48("2212"), 'https://soroban-testnet.stellar.org')),
  SOROBAN_CONTRACT_ID: Joi.string().allow(stryMutAct_9fa48("2213") ? "Stryker was here!" : (stryCov_9fa48("2213"), '')).default(stryMutAct_9fa48("2214") ? "Stryker was here!" : (stryCov_9fa48("2214"), '')),
  ANALYTICS_CONTRACT_ID: Joi.string().allow(stryMutAct_9fa48("2215") ? "Stryker was here!" : (stryCov_9fa48("2215"), '')).default(stryMutAct_9fa48("2216") ? "Stryker was here!" : (stryCov_9fa48("2216"), '')),
  TOKEN_CONTRACT_ID: Joi.string().allow(stryMutAct_9fa48("2217") ? "Stryker was here!" : (stryCov_9fa48("2217"), '')).default(stryMutAct_9fa48("2218") ? "Stryker was here!" : (stryCov_9fa48("2218"), '')),
  CREDENTIAL_METADATA_CONTRACT_ID: Joi.string().allow(stryMutAct_9fa48("2219") ? "Stryker was here!" : (stryCov_9fa48("2219"), '')).default(stryMutAct_9fa48("2220") ? "Stryker was here!" : (stryCov_9fa48("2220"), '')),
  INDEXER_POLL_INTERVAL_MS: Joi.number().default(5000),
  STELLAR_WEB_AUTH_DOMAIN: Joi.string().default(stryMutAct_9fa48("2221") ? "" : (stryCov_9fa48("2221"), 'localhost')),
  // Mail
  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_SECURE: Joi.boolean().default(stryMutAct_9fa48("2222") ? true : (stryCov_9fa48("2222"), false)),
  EMAIL_USER: Joi.string().required(),
  EMAIL_PASS: Joi.string().required(),
  EMAIL_FROM: Joi.string().default(stryMutAct_9fa48("2223") ? "" : (stryCov_9fa48("2223"), '"Scoopdope" <no-reply@Scoopdope.app>')),
  EMAIL_ENABLED: Joi.boolean().default(stryMutAct_9fa48("2224") ? true : (stryCov_9fa48("2224"), false)),
  // Frontend
  FRONTEND_URL: Joi.string().uri().default(stryMutAct_9fa48("2225") ? "" : (stryCov_9fa48("2225"), 'http://localhost:3001')),
  // Google OAuth (optional)
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().default(stryMutAct_9fa48("2226") ? "" : (stryCov_9fa48("2226"), 'http://localhost:3000/auth/google/callback')),
  // Throttle
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(100),
  // KYC
  KYC_PROVIDER_API_KEY: Joi.string().allow(stryMutAct_9fa48("2227") ? "Stryker was here!" : (stryCov_9fa48("2227"), '')).default(stryMutAct_9fa48("2228") ? "Stryker was here!" : (stryCov_9fa48("2228"), '')),
  // AWS
  AWS_REGION: Joi.string().default(stryMutAct_9fa48("2229") ? "" : (stryCov_9fa48("2229"), 'us-east-1')),
  AWS_ACCESS_KEY_ID: Joi.string().allow(stryMutAct_9fa48("2230") ? "Stryker was here!" : (stryCov_9fa48("2230"), '')).default(stryMutAct_9fa48("2231") ? "Stryker was here!" : (stryCov_9fa48("2231"), '')),
  AWS_SECRET_ACCESS_KEY: Joi.string().allow(stryMutAct_9fa48("2232") ? "Stryker was here!" : (stryCov_9fa48("2232"), '')).default(stryMutAct_9fa48("2233") ? "Stryker was here!" : (stryCov_9fa48("2233"), '')),
  // Moderation
  MODERATION_TOXICITY_THRESHOLD: stryMutAct_9fa48("2235") ? Joi.number().max(0).max(1).default(0.7) : stryMutAct_9fa48("2234") ? Joi.number().min(0).min(1).default(0.7) : (stryCov_9fa48("2234", "2235"), Joi.number().min(0).max(1).default(0.7)),
  // Elasticsearch
  ELASTICSEARCH_NODE: Joi.string().uri().default(stryMutAct_9fa48("2236") ? "" : (stryCov_9fa48("2236"), 'http://localhost:9200')),
  ELASTICSEARCH_API_KEY: Joi.string().allow(stryMutAct_9fa48("2237") ? "Stryker was here!" : (stryCov_9fa48("2237"), '')).default(stryMutAct_9fa48("2238") ? "Stryker was here!" : (stryCov_9fa48("2238"), '')),
  // Stripe
  STRIPE_SECRET_KEY: Joi.string().allow(stryMutAct_9fa48("2239") ? "Stryker was here!" : (stryCov_9fa48("2239"), '')).default(stryMutAct_9fa48("2240") ? "Stryker was here!" : (stryCov_9fa48("2240"), '')),
  STRIPE_WEBHOOK_SECRET: Joi.string().allow(stryMutAct_9fa48("2241") ? "Stryker was here!" : (stryCov_9fa48("2241"), '')).default(stryMutAct_9fa48("2242") ? "Stryker was here!" : (stryCov_9fa48("2242"), '')),
  STRIPE_PRO_PRICE_ID: Joi.string().allow(stryMutAct_9fa48("2243") ? "Stryker was here!" : (stryCov_9fa48("2243"), '')).default(stryMutAct_9fa48("2244") ? "Stryker was here!" : (stryCov_9fa48("2244"), '')),
  STRIPE_ENTERPRISE_PRICE_ID: Joi.string().allow(stryMutAct_9fa48("2245") ? "Stryker was here!" : (stryCov_9fa48("2245"), '')).default(stryMutAct_9fa48("2246") ? "Stryker was here!" : (stryCov_9fa48("2246"), '')),
  // Exchange Rate (optional — falls back to free open.er-api.com)
  EXCHANGE_RATE_API_KEY: Joi.string().allow(stryMutAct_9fa48("2247") ? "Stryker was here!" : (stryCov_9fa48("2247"), '')).default(stryMutAct_9fa48("2248") ? "Stryker was here!" : (stryCov_9fa48("2248"), ''))
}));