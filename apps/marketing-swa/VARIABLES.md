# Practx Marketing Static Web App variables

The marketing Static Web App exposes a small surface area of configuration. Use the names below when wiring deployment pipelines
or publishing configuration snippets so the repo stays consistent with the broader Practx naming scheme.

| Name | Scope | Description |
| --- | --- | --- |
| `PRACTX_MARKETING_SWA__API_BASE_URL` | Browser global (set via inline `<script>`) | Optional override for the API Management base URL. Defaults to the production gateway when unset. |
| `PRACTX_MARKETING_SWA__DEPLOYMENT_TOKEN` | Azure DevOps variable / secret | Static Web App deployment token consumed by the AzureStaticWebApp task. |
| `PRACTX_MARKETING_SWA__APP_LOCATION` | Azure DevOps variable | Path to the frontend relative to the repo root (defaults to `apps/marketing-swa/frontend`). |

When running locally, you can temporarily set `window.PRACTX_MARKETING_SWA__API_BASE_URL` before loading `signup.js` to target a
non-production API Management environment. Deployment pipelines should source the required variables from the
`Practx-Marketing-SWA` variable group described in the README.
