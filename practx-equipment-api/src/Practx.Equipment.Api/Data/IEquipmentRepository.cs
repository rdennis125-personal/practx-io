using Practx.Equipment.Api.Models;

namespace Practx.Equipment.Api.Data;

public interface IEquipmentRepository
{
    Task<EquipmentRecord?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<EquipmentRecord?> GetByAssetIdAsync(string assetId, CancellationToken cancellationToken);
    Task<IReadOnlyList<EquipmentRecord>> ListAsync(EquipmentQuery query, CancellationToken cancellationToken);
    Task<EquipmentRecord> CreateAsync(EquipmentRecord record, CancellationToken cancellationToken);
    Task<EquipmentRecord> UpdateAsync(EquipmentRecord record, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
