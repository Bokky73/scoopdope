# CORS Policy

## Overview

scoopdope uses environment-aware CORS configuration. In **production**, only explicitly allowed origins are permitted. In **development**, all origins are allowed for convenience.

## Configuration

Set these environment variables:

| Variable | Description | Default |
|---|---|---|
| `CORS_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:3001` |
| `CORS_CREDENTIALS` | Allow cookies/auth headers cross-origin | `false` |
| `CORS_MAX_AGE` | Preflight cache duration in seconds | `86400` (24h) |

### Example (production)
```env
CORS_ORIGINS=https://app.Scoopdope.io,https://www.Scoopdope.io
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400
```

## Allowed Headers

- `Content-Type`
- `Authorization`
- `X-API-KEY`
- `X-Webhook-Signature`

## Allowed Methods

`GET`, `HEAD`, `PUT`, `PATCH`, `POST`, `DELETE`, `OPTIONS`

## Preflight Caching

Preflight (`OPTIONS`) responses are cached for `CORS_MAX_AGE` seconds (default 24h), reducing latency for repeated cross-origin requests.

## Behavior by Environment

| Environment | Origin Policy |
|---|---|
| `production` | Only `CORS_ORIGINS` list |
| `development` / `test` | All origins (`*`) |
