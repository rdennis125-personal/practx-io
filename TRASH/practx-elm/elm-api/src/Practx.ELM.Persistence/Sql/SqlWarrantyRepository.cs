using Microsoft.EntityFrameworkCore;
using Practx.ELM.Domain.Entities;
using Practx.ELM.Domain.Ports;

namespace Practx.ELM.Persistence.Sql;

internal sealed class SqlWarrantyRepository : IWarrantyRepository
{
    private readonly ElmDbContext _dbContext;

    public SqlWarrantyRepository(ElmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<WarrantyContract> AddContractAsync(WarrantyContract contract, CancellationToken cancellationToken)
    {
        var entity = new SqlWarrantyContract
        {
            WarrantyContractId = contract.WarrantyContractId,
            DeviceId = contract.DeviceId,
            ManufacturerId = contract.ManufacturerId,
            WarrantyDefId = contract.WarrantyDefId,
            EffectiveOn = contract.EffectiveOn,
            ExpiresOn = contract.ExpiresOn,
            Status = contract.Status
        };

        _dbContext.WarrantyContracts.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return contract;
    }

    public async Task<WarrantyContract?> GetContractAsync(Guid contractId, CancellationToken cancellationToken)
    {
        var entity = await _dbContext.WarrantyContracts.AsNoTracking().SingleOrDefaultAsync(c => c.WarrantyContractId == contractId, cancellationToken);
        return entity is null ? null : MapContract(entity);
    }

    public async Task<WarrantyDefinition?> GetDefinitionAsync(Guid warrantyDefId, CancellationToken cancellationToken)
    {
        var entity = await _dbContext.WarrantyDefinitions
            .AsNoTracking()
            .Include(d => d.Coverages)
            .SingleOrDefaultAsync(d => d.WarrantyDefId == warrantyDefId, cancellationToken);
        return entity is null ? null : MapDefinition(entity);
    }

    public async Task<(WarrantyContract? contract, WarrantyDefinition? definition)> GetActiveWarrantyAsync(Guid deviceId, DateOnly onDate, CancellationToken cancellationToken)
    {
        var contractEntity = await _dbContext.WarrantyContracts
            .AsNoTracking()
            .Where(c => c.DeviceId == deviceId)
            .Where(c => c.EffectiveOn <= onDate && c.ExpiresOn >= onDate)
            .OrderByDescending(c => c.EffectiveOn)
            .FirstOrDefaultAsync(cancellationToken);

        if (contractEntity is null)
        {
            return (null, null);
        }

        var definitionEntity = await _dbContext.WarrantyDefinitions
            .AsNoTracking()
            .Include(d => d.Coverages)
            .SingleOrDefaultAsync(d => d.WarrantyDefId == contractEntity.WarrantyDefId, cancellationToken);

        return (MapContract(contractEntity), definitionEntity is null ? null : MapDefinition(definitionEntity));
    }

    public async Task<(WarrantyContract? contract, WarrantyDefinition? definition)> GetLatestWarrantyAsync(Guid deviceId, CancellationToken cancellationToken)
    {
        var contractEntity = await _dbContext.WarrantyContracts
            .AsNoTracking()
            .Where(c => c.DeviceId == deviceId)
            .OrderByDescending(c => c.EffectiveOn)
            .FirstOrDefaultAsync(cancellationToken);

        if (contractEntity is null)
        {
            return (null, null);
        }

        var definitionEntity = await _dbContext.WarrantyDefinitions
            .AsNoTracking()
            .Include(d => d.Coverages)
            .SingleOrDefaultAsync(d => d.WarrantyDefId == contractEntity.WarrantyDefId, cancellationToken);

        return (MapContract(contractEntity), definitionEntity is null ? null : MapDefinition(definitionEntity));
    }

    private static WarrantyContract MapContract(SqlWarrantyContract entity)
        => new(
            entity.WarrantyContractId,
            entity.DeviceId,
            entity.ManufacturerId,
            entity.WarrantyDefId,
            entity.EffectiveOn,
            entity.ExpiresOn,
            entity.Status);

    private static WarrantyDefinition MapDefinition(SqlWarrantyDefinition entity)
        => new(
            entity.WarrantyDefId,
            entity.ManufacturerId,
            entity.Name,
            entity.Coverages.Select(c => c.ServiceTypeId).ToList(),
            entity.DurationMonths);
}
