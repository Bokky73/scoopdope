# SEP-0010 Stellar Web Authentication

scoopdope implements [SEP-0010](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md) — the Stellar Web Authentication standard — allowing any Stellar wallet to authenticate without a password.

---

## How It Works

1. **Client requests a challenge** — the server builds a transaction that the client must sign.
2. **Client signs the challenge** — using their Stellar keypair (e.g. via Freighter).
3. **Client submits the signed transaction** — the server verifies the signature and returns a JWT.

The JWT is identical to the one issued by the email/password login flow and can be used in all `Authorization: Bearer <token>` headers.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `STELLAR_WEB_AUTH_DOMAIN` | Domain embedded in the challenge transaction | `localhost` |
| `STELLAR_SECRET_KEY` | Server signing keypair (same key used for credential issuance) | required |

Set `STELLAR_WEB_AUTH_DOMAIN` to your public hostname in production, e.g. `api.Scoopdope.app`.

---

## API Reference

### `GET /auth/stellar?account=<publicKey>`

Returns an unsigned SEP-0010 challenge transaction.

**Query parameters**

| Parameter | Description |
|---|---|
| `account` | Client's Stellar public key (`G...`) |

**Response**

```json
{
  "transaction": "<base64-encoded XDR>",
  "network_passphrase": "Test SDF Network ; September 2015"
}
```

---

### `POST /auth/stellar`

Verifies the signed challenge and returns a JWT.

**Request body**

```json
{
  "transaction": "<base64-encoded signed XDR>"
}
```

**Response**

```json
{
  "access_token": "<JWT>"
}
```

**Error responses**

| Status | Reason |
|---|---|
| `401` | Signature invalid, challenge expired, or wrong server key |

---

## Client Integration Example

```typescript
import { getPublicKey, signTransaction } from '@stellar/freighter-api';

// 1. Get challenge
const { transaction, network_passphrase } = await fetch(
  `/auth/stellar?account=${await getPublicKey()}`
).then(r => r.json());

// 2. Sign with Freighter
const { signedTxXdr } = await signTransaction(transaction, { networkPassphrase: network_passphrase });

// 3. Exchange for JWT
const { access_token } = await fetch('/auth/stellar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ transaction: signedTxXdr }),
}).then(r => r.json());
```

---

## Account Provisioning

If the Stellar public key is not linked to any existing scoopdope account, a new account is automatically created and the public key is stored as its `stellarPublicKey`. The user can later link an email/password via the profile settings.

---

## Security Notes

- Challenges expire after **5 minutes** (enforced by `Utils.readChallengeTx`).
- The server verifies that the transaction was signed by the claimed client key and that the server's own signature is present.
- The `web_auth_domain` in the challenge must match `STELLAR_WEB_AUTH_DOMAIN` — this prevents replay attacks across different services.
