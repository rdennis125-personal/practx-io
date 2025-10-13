# Practx Contracts

This directory stores the contracts-first assets that back each Practx API.

## Structure

- `openapi/` – Versioned OpenAPI documents per service.
- `odcs/` – Open Data Contract Standard (ODCS) schemas (placeholders for now).
- `policies/spectral.yaml` – Spectral configuration enforcing Practx API guidelines.

## Validation

Run Spectral against the OpenAPI specifications:

```bash
npx @stoplight/spectral-cli lint openapi/**/openapi.yaml -r policies/spectral.yaml
```

The build workflow `github/workflows/build-contracts.yml` executes these checks automatically.
