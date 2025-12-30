namespace Practx.Equipment.Api.Models;

public sealed record EquipmentQuery(
    string? Search,
    EquipmentStatus? Status,
    EquipmentSortKey SortKey,
    SortDirection SortDirection,
    int Limit,
    int Offset
);

public enum EquipmentSortKey
{
    SpendYearToDate,
    NextServiceDate,
}

public enum SortDirection
{
    Asc,
    Desc,
}
