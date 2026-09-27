import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // App
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  LOG_FORMAT: Joi.string().valid('text', 'json').default('text'),

  // Database
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_POOL_MIN: Joi.number().integer().min(1).max(20).default(5),
  DATABASE_POOL_MAX: Joi.number().integer().min(5).max(100).default(20),
  DATABASE_IDLE_TIMEOUT_MS: Joi.number().integer().min(1000).default(30000),

  // JWT
  JWT_SECRET: Joi.string().min(16).required(),

  // Redis
  REDIS_URL: Joi.string().uri().optional(),
  REDIS_HOST: Joi.string().optional(),
  REDIS_PORT: Joi.number().optional(),
  REDIS_PASSWORD: Joi.string().optional(),
  REDIS_DB: Joi.number().default(0),

  // Stellar
  STELLAR_NETWORK: Joi.string().valid('testnet', 'mainnet').default('testnet'),
  STELLAR_SECRET_KEY: Joi.string().optional(),
  SOROBAN_RPC_URL: Joi.string().uri().default('https://soroban-testnet.stellar.org'),
  SOROBAN_CONTRACT_ID: Joi.string().allow('').default(''),
  ENROLLMENT_CONTRACT_ID: Joi.string().allow('').default(''),
  ANALYTICS_CONTRACT_ID: Joi.string().allow('').default(''),
  TOKEN_CONTRACT_ID: Joi.string().allow('').default(''),
  CREDENTIAL_METADATA_CONTRACT_ID: Joi.string().allow('').default(''),
  CERTIFICATE_CONTRACT_ID: Joi.string().allow('').default(''),
  INDEXER_POLL_INTERVAL_MS: Joi.number().default(5000),
  STELLAR_WEB_AUTH_DOMAIN: Joi.string().default('localhost'),

  // Mail
  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_SECURE: Joi.boolean().default(false),
  EMAIL_USER: Joi.string().required(),
  EMAIL_PASS: Joi.string().required(),
  EMAIL_FROM: Joi.string().default('"Scoopdope" <no-reply@Scoopdope.app>'),
  EMAIL_ENABLED: Joi.boolean().default(false),

  // Batch queue
  BATCH_JOB_MAX_RETRIES: Joi.number().default(3),
  BATCH_ALERT_SLACK_WEBHOOK_URL: Joi.string().uri().allow('').default(''),
  BATCH_ALERT_PAGERDUTY_ROUTING_KEY: Joi.string().allow('').default(''),

  // Frontend
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3001'),

  // CORS
  CORS_ORIGINS: Joi.string().default('http://localhost:3001'),
  CORS_CREDENTIALS: Joi.boolean().default(false),
  CORS_MAX_AGE: Joi.number().integer().min(0).default(86400),

  // Google OAuth (optional)
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().default('http://localhost:3000/auth/google/callback'),

  // Throttle
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(100),

  // KYC
  KYC_PROVIDER_API_KEY: Joi.string().allow('').default(''),

  // AWS
  AWS_REGION: Joi.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: Joi.string().allow('').default(''),
  AWS_SECRET_ACCESS_KEY: Joi.string().allow('').default(''),

  // Moderation
  MODERATION_TOXICITY_THRESHOLD: Joi.number().min(0).max(1).default(0.7),

  // Elasticsearch
  ELASTICSEARCH_NODE: Joi.string().uri().default('http://localhost:9200'),
  ELASTICSEARCH_API_KEY: Joi.string().allow('').default(''),

  // Stripe
  STRIPE_SECRET_KEY: Joi.string().allow('').default(''),
  STRIPE_WEBHOOK_SECRET: Joi.string().allow('').default(''),
  STRIPE_PRO_PRICE_ID: Joi.string().allow('').default(''),
  STRIPE_ENTERPRISE_PRICE_ID: Joi.string().allow('').default(''),

  // Exchange Rate (optional — falls back to free open.er-api.com)
  EXCHANGE_RATE_API_KEY: Joi.string().allow('').default(''),

  // OpenTelemetry
  OTEL_SAMPLING_RATE: Joi.number().min(0).max(1).default(0.1),

  // Payouts
  PAYOUT_BATCH_SIZE: Joi.number().integer().min(1).default(500),

  // Rewards
  REWARD_MODULE_COMPLETION: Joi.number().integer().min(0).default(25),
  REWARD_COURSE_COMPLETION: Joi.number().integer().min(0).default(100),
});
