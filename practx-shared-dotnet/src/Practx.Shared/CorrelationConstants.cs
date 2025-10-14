namespace Practx.Shared;

/// <summary>
/// Provides constant values shared across Practx components.
/// </summary>
public static class CorrelationConstants
{
    /// <summary>
    /// The HTTP header used to propagate the correlation identifier.
    /// </summary>
    public const string CorrelationHeaderName = "x-correlation-id";

    /// <summary>
    /// The key used to store the correlation identifier in the <see cref="HttpContext.Items" /> collection.
    /// </summary>
    public const string CorrelationItemKey = "Practx.CorrelationId";
}
