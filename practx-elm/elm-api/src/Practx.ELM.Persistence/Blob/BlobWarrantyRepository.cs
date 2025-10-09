using Practx.ELM.Domain.Entities;
using Practx.ELM.Domain.Ports;

namespace Practx.ELM.Persistence.Blob;

internal sealed class BlobWarrantyRepository : IWarrantyRepository
{
    private readonly BlobDataStore _store;

    public BlobWarrantyRepository(BlobDataStore store)
    {
        _store = store;
    }

    public Task<WarrantyContract> AddContractAsync(WarrantyContract contract, CancellationToken cancellationToken)
    {
        _store.EnsureSeeded();
        _store.UpsertWarrantyContract(contract);
        return Task.FromResult(contract);
    }

    public Task<WarrantyContract?> GetContractAsync(Guid contractId, CancellationToken cancellationToken)
    {
        _store.EnsureSeeded();
        var contract = _store.GetWarrantyContracts().SingleOrDefault(c => c.WarrantyContractId == contractId);
        return Task.FromResult(contract);
    }

    public Task<WarrantyDefinition?> GetDefinitionAsync(Guid warrantyDefId, CancellationToken cancellationToken)
    {
        _store.EnsureSeeded();
        var definition = _store.GetWarrantyDefinitions().SingleOrDefault(d => d.WarrantyDefId == warrantyDefId);
        return Task.FromResult(definition);
    }

    public Task<(WarrantyContract? contract, WarrantyDefinition? definition)> GetActiveWarrantyAsync(Guid deviceId, DateOnly onDate, CancellationToken cancellationToken)
    {
        _store.EnsureSeeded();
        var contract = _store.GetWarrantyContracts()
            .Where(c => c.DeviceId == deviceId)
            .Where(c => c.EffectiveOn <= onDate && c.ExpiresOn >= onDate)
            .OrderByDescending(c => c.EffectiveOn)
            .FirstOrDefault();
        var definition = contract is null
            ? null
            : _store.GetWarrantyDefinitions().SingleOrDefault(d => d.WarrantyDefId == contract.WarrantyDefId);
        return Task.FromResult((contract, definition));
    }

    public Task<(WarrantyContract? contract, WarrantyDefinition? definition)> GetLatestWarrantyAsync(Guid deviceId, CancellationToken cancellationToken)
    {
        _store.EnsureSeeded();
        var contract = _store.GetWarrantyContracts()
            .Where(c => c.DeviceId == deviceId)
            .OrderByDescending(c => c.EffectiveOn)
            .FirstOrDefault();
        var definition = contract is null
            ? null
            : _store.GetWarrantyDefinitions().SingleOrDefault(d => d.WarrantyDefId == contract.WarrantyDefId);
        return Task.FromResult((contract, definition));
    }
}
