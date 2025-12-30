namespace Practx.Equipment.Api;

public static class DiagnosticsPayloads
{
    public static string HealthJson() => "{\"status\":\"healthy\"}";

    public static string VersionJson()
    {
        var version = typeof(DiagnosticsPayloads).Assembly.GetName().Version?.ToString() ?? "0.0.0";
        return $"{{\"version\":\"{version}\"}}";
    }
}
