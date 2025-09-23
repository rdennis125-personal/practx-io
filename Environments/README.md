# Azure Dev Center Catalog

This folder hosts the Azure Dev Center catalog artifacts for practx.io.  Azure Dev Center reads the
contents of `EnvironmentDefinitions/` to expose self-service environments for engineering teams.  The
catalog is synchronized automatically from the `main` branch.

```
Environments/
├─ EnvironmentDefinitions/
│  └─ practx-shared-storage/
│     ├─ environment.yaml   # Definition manifest consumed by Azure Dev Center
│     └─ main.bicep         # Infrastructure template deployed by the catalog
└─ README.md
```

Add new environment definitions by creating a new folder under `EnvironmentDefinitions/` that
contains at minimum an `environment.yaml` manifest and the referenced infrastructure template (Bicep
or ARM).  The GitHub Actions and Azure DevOps pipelines will lint every `*.bicep` file in the repo and
must succeed before a pull request can be merged.

> ℹ️ The Dev Center environments for this project are `DEV`, `QA1`, and `PROD`.  Environment
> definitions should scope inputs and policy to those types when appropriate.
