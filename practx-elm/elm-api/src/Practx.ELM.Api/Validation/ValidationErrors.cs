namespace Practx.ELM.Api.Validation;

internal sealed class ValidationErrors
{
    private readonly Dictionary<string, List<string>> _errors = new();

    public void Add(string key, string message)
    {
        if (!_errors.TryGetValue(key, out var list))
        {
            list = new List<string>();
            _errors[key] = list;
        }

        list.Add(message);
    }

    public Dictionary<string, string[]>? Build()
        => _errors.Count == 0
            ? null
            : _errors.ToDictionary(kvp => kvp.Key, kvp => kvp.Value.ToArray());
}
