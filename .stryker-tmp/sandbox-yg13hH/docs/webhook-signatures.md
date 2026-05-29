# Webhook Signature Verification

## Overview

Every webhook delivery is signed using HMAC-SHA256. Consumers must verify the signature to ensure authenticity and prevent replay attacks.

## Headers

Each webhook request includes:

| Header | Description |
|---|---|
| `X-Webhook-Signature` | `sha256=<hmac-hex>` |
| `X-Webhook-Timestamp` | Unix timestamp (seconds) when the request was sent |

## Signature Algorithm

```
signature = "sha256=" + HMAC-SHA256(secret, raw_body)
```

- `secret`: the webhook secret returned when registering the webhook
- `raw_body`: the raw JSON request body (do not parse before verifying)

## Verification Steps

1. Extract `X-Webhook-Signature` and `X-Webhook-Timestamp` from headers
2. Reject if timestamp is older than **5 minutes** (replay protection)
3. Compute `expected = "sha256=" + HMAC-SHA256(secret, raw_body)`
4. Compare using a **timing-safe** comparison

### Node.js Example

```js
const crypto = require('crypto');

function verifyWebhook(secret, rawBody, signature, timestamp) {
  // Replay protection
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    throw new Error('Timestamp too old');
  }

  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

### Python Example

```python
import hmac, hashlib, time

def verify_webhook(secret, raw_body, signature, timestamp):
    # Replay protection
    if abs(time.time() - int(timestamp)) > 300:
        raise ValueError("Timestamp too old")

    expected = 'sha256=' + hmac.new(
        secret.encode(), raw_body, hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected)
```

## Testing Signatures

Use the verification endpoint to test your implementation:

```
POST /v1/webhooks/verify-signature
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "webhookId": "<your-webhook-id>",
  "body": "{\"event\":\"test\"}",
  "signature": "sha256=<computed-hmac>",
  "timestamp": "1714000000"
}
```

Returns `{ "valid": true }` on success, or `401 Unauthorized` if invalid.
