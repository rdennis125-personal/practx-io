namespace Practx.Equipment.Api.Dtos;

public sealed record EquipmentListResponse(
    IReadOnlyList<EquipmentResponse> Items,
    int Limit,
    int Offset,
    int Count
);
