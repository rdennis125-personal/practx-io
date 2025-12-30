using Practx.Equipment.Api.Dtos;

namespace Practx.Equipment.Api.Services;

public interface IEquipmentService
{
    Task<EquipmentResponse> CreateAsync(EquipmentCreateRequest request, CancellationToken cancellationToken);
    Task<EquipmentResponse?> GetAsync(Guid id, CancellationToken cancellationToken);
    Task<EquipmentListResponse> ListAsync(string? search, string? status, string? sort, string? direction, int? limit, int? offset, CancellationToken cancellationToken);
    Task<EquipmentResponse?> UpdateAsync(Guid id, EquipmentUpdateRequest request, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
