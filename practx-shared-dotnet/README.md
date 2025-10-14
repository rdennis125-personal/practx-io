# Practx Shared .NET Library

The `Practx.Shared` package contains middleware and service extensions that provide a consistent
observability experience across Practx APIs. It exposes:

- Correlation ID middleware that ensures every request and response includes the `x-correlation-id` header.
- Logging and HTTP logging defaults wired through `AddPractxTelemetry`.
- Minimal API helpers via `AddPractxApiDefaults`.

## Projects

- `src/Practx.Shared/Practx.Shared.csproj`
- `tests/Practx.Shared.Tests/Practx.Shared.Tests.csproj`

## Local development

```bash
dotnet restore
dotnet test
```

## Publishing

Use the GitHub Actions workflows (`build-shared-dotnet.yml` and `publish-shared-dotnet.yml`) to validate
and publish the package to the internal NuGet feed once repository secrets are configured.
