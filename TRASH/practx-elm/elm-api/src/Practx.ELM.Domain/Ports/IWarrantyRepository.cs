using Practx.ELM.Domain.Entities;

namespace Practx.ELM.Domain.Ports;

public interface IWarrantyRepository
{
    Task<WarrantyContract> AddContractAsync(WarrantyContract contract, CancellationToken cancellationToken);

    Task<WarrantyContract?> GetContractAsync(Guid contractId, CancellationToken cancellationToken);

    Task<WarrantyDefinition?> GetDefinitionAsync(Guid warrantyDefId, CancellationToken cancellationToken);

    Task<(WarrantyContract? contract, WarrantyDefinition? definition)> GetActiveWarrantyAsync(Guid deviceId, DateOnly onDate, CancellationToken cancellationToken);

    Task<(WarrantyContract? contract, WarrantyDefinition? definition)> GetLatestWarrantyAsync(Guid deviceId, CancellationToken cancellationToken);
}
