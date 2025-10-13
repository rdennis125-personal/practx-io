# Practx API Management Assets

Use `import.sh` to push the versioned OpenAPI specifications from `practx-contracts/openapi` into an
Azure API Management instance.

```bash
./import.sh <apim-name> <resource-group> [api-suffix]
```

The script requires `az` with the API Management extension installed.
