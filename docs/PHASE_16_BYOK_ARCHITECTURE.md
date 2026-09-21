# Phase 16 — Strict BYOK (Bring Your Own Key) Architecture Record

This document outlines the architecture, database schema, encryption strategy, and key verification workflows for the **Strict BYOK** model in the **AI Career Mentor** platform.

---

## 1. Current Phase 10 Architecture vs. Strict BYOK

### Current Global-Key Architecture
```text
Authenticated User
       ↓
Express API Route (e.g. /api/v1/recommendations/generate)
       ↓
Gemini Service reads global GEMINI_API_KEY from process.env
       ↓
Call Gemini REST Endpoint (Global Key)
```

### Strict BYOK Architecture
```text
Authenticated User
       ↓
Express API Route (e.g. /api/v1/recommendations/generate)
       ↓
Backend loads UserAICredential for req.user.id
       ↓
Credential exists?
   ├── NO → Return 403 Forbidden ("Gemini AI key is not connected")
   └── YES
        ↓
Decrypt key in backend memory (AES-256-GCM)
        ↓
Invoke Gemini REST Endpoint (User-Specific Key)
```

---

## 2. Strict BYOK Rules
1. **No Fallback**: There is **no global** `GEMINI_API_KEY` fallback configuration. If a user does not have a verified key registered, AI operations return a `403` code with a structured error type `GEMINI_KEY_NOT_CONFIGURED`.
2. **Backend-Only Storage**: Decrypted API keys are never stored in log files, database documents, or shared with client bundles.
3. **Registration Status**: All new users initialize with `status = "not_configured"`.

---

## 3. Database Schema: `user_ai_credentials`

A new collection is defined to store secure credentials:

### `user_ai_credentials`
- Schema fields:
  - `userId`: ObjectId (ref: 'User', required, index: true)
  - `provider`: String (required, enum: ['google_gemini'])
  - `encryptedApiKey`: String (required)
  - `maskedKey`: String (required)
  - `status`: String (enum: ['connected', 'invalid'], default: 'connected')
  - `validatedAt`: Date (required)
- **Unique Constraint Index**:
  - `{ userId: 1, provider: 1 }` with `{ unique: true }`.
  - *Justification*: Prevents duplicate keys for the same AI provider under a single user account.

---

## 4. Encryption Strategy (AES-256-GCM)

All API keys are encrypted at rest using Galois/Counter Mode (AES-256-GCM), providing confidentiality and authentication:
- **Keys and Secrets**: Loaded from backend environment variable `ENCRYPTION_KEY` (32 bytes hex-encoded key).
- **Ciphertext format**: Stored as `ivHex:authTagHex:encryptedTextHex`.
- **Decryption**: Decrypted on-the-fly inside memory when making direct HTTP REST requests to Google Gemini endpoints.
- **Failures**: Any decryption mismatch (corrupted cipher text or incorrect encryption key) returns an immediate validation error.

---

## 5. Key Save & Verification Pipeline

```text
User submits key via POST /api/v1/settings/ai/gemini
                   ↓
Backend verifies JWT user ID
                   ↓
Validate key format (non-empty string)
                   ↓
Test Key: Make a dummy request to Gemini (e.g. v1 generateContent)
                   ↓
Success?
   ├── NO → Return 400 Bad Request ("Invalid API Key") without altering database
   └── YES
        ↓
Encrypt key using AES-256-GCM
        ↓
Upsert record in user_ai_credentials
        ↓
Return connection metadata (maskedKey, validatedAt)
```

---

## 6. Key Replacement & Removal
- **Replacement**: If replacement input key is invalid, the existing working key is preserved.
- **Removal**: `DELETE /api/v1/settings/ai/gemini` removes the document completely. Cached recommendations remain accessible.

---

## 7. Threat Modeling & Controls
- **Plaintext Leakage**: Decrypted keys exist only inside transient node process memory during request lifecycle.
- **Cross-user Access**: CRUD Settings operations verify owner ID matching `req.user.id`.
- **Corrupted Key Recoveries**: If key decryption fails, the status resets to `invalid` and flags the user to reconnect a new key.

---

## 8. API Design Specifications

### GET `/api/v1/settings/ai`
- Returns active connection credentials (excludes keys):
```json
{
  "success": true,
  "data": {
    "provider": "google_gemini",
    "status": "connected",
    "maskedKey": "••••••••••••8K1B",
    "validatedAt": "2026-08-11T23:35:17.000Z"
  }
}
```

### POST `/api/v1/settings/ai/gemini`
- Payload: `{ apiKey: "AIzaSy..." }`
- Returns connection metadata upon validation.

### DELETE `/api/v1/settings/ai/gemini`
- Removes stored credential.

---

## 9. Migration & Environment Updates
- **Environment**:
  - Remove `GEMINI_API_KEY` from backend `.env`.
  - Add `ENCRYPTION_KEY` (32-byte hex string) to backend `.env`.
- **Existing Users**: Default to `status: "not_configured"`. Pre-existing recommendations cache remain readable.
- **Development**: Dev environments require a local `ENCRYPTION_KEY` and configuring their own key under Settings tab.

---

## 10. Implementation & Verification Status

The Strict BYOK architecture has been fully implemented and runtime verified:
- **AES-256-GCM Encryption**: Successfully encrypts/decrypts in backend memory. Masks key values when returning settings data.
- **Verification Gates**: Validate credentials via lightweight Gemini REST requests. Invalid keys are rejected before saving.
- **User Isolation**: Authenticated `userId` restricts settings routes and credential storage access.
- **Cascading deletion**: Added `UserAICredential` to the account deletion pipeline.

