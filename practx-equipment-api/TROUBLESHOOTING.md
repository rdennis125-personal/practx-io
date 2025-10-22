# Practx Equipment API Deployment Troubleshooting

## Runtime identification
- Detected as an ASP.NET Core minimal API (see `src/Practx.Equipment.Api/Program.cs`).
- Target framework: .NET 8.0.
- Expected hosting model: Azure App Service for Linux using zip deploy.

## Observed failures
- No deployment workflow is present under `.github/workflows`, so the API is never built or pushed to Azure.
- Repository variables/secrets for Azure deployment are undocumented, increasing the chance of misconfiguration.
- There is no automated validation of the OpenAPI contract prior to deployment.

## Remediation summary
- Authored `.github/workflows/deploy-equipment-api.yml` to build, test, lint OpenAPI, and deploy to App Service via `azure/webapps-deploy@v3`.
- Added Spectral-based OpenAPI validation and documented the required GitHub variables/secrets in `README.md`.
- Introduced `scripts/smoke.sh` to exercise the `/healthz` endpoint post-deployment and surface failures early.

## Fix verification
- `npm run lint:openapi` succeeds locally and in CI, ensuring the contract is valid before deploy.
- Deployment workflow publishes a zip artifact, validates Azure resources, and runs a smoke test after release.

## Follow-up items
- Configure the repository variables (`AZURE_SUBSCRIPTION_ID`, `AZURE_TENANT_ID`, `AZ_RG`, `SERVICE_NAME`, `ENV_NAME`, `APIM_NAME` if applicable) and secret (`AZURE_CLIENT_ID`) in GitHub.
- Set up a federated credential for the GitHub Actions workflow if not already provisioned.
- Monitor workflow runs and adjust API Management parameters (`--path` / `--api-id`) if different route naming is desired.
