using Microsoft.EntityFrameworkCore;
using Practx.ELM.Domain.ValueObjects;

namespace Practx.ELM.Persistence.Sql;

internal sealed class SqlPersistenceSeeder : IPersistenceSeeder
{
    private readonly ElmDbContext _dbContext;

    public SqlPersistenceSeeder(ElmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task SeedAsync(CancellationToken cancellationToken)
    {
        await _dbContext.Database.EnsureCreatedAsync(cancellationToken);

        if (await _dbContext.DeviceTypes.AnyAsync(cancellationToken))
        {
            return;
        }

        var manufacturerId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var chairType = new SqlDeviceType { DeviceTypeId = Guid.Parse("44444444-4444-4444-4444-444444444444"), Name = "Chair", AllowsSpaceAssignments = true };
        var instrumentType = new SqlDeviceType { DeviceTypeId = Guid.Parse("55555555-5555-5555-5555-555555555555"), Name = "Instrument", AllowsSpaceAssignments = false };

        var chairModel = new SqlDeviceModel { DeviceModelId = Guid.Parse("66666666-6666-6666-6666-666666666666"), DeviceTypeId = chairType.DeviceTypeId, ManufacturerId = manufacturerId, Name = "Standard Chair" };
        var instrModel = new SqlDeviceModel { DeviceModelId = Guid.Parse("77777777-7777-7777-7777-777777777777"), DeviceTypeId = instrumentType.DeviceTypeId, ManufacturerId = manufacturerId, Name = "Standard Instrument" };

        var serviceTypePm = new SqlServiceType { ServiceTypeId = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"), Name = "Preventative Maintenance" };
        var serviceTypeRepair = new SqlServiceType { ServiceTypeId = Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"), Name = "Repair" };

        var provider = new SqlProvider { ProviderId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"), Name = "Provider Alpha" };

        var providerCertChair = new SqlProviderCertification
        {
            CertificationId = Guid.NewGuid(),
            ProviderId = provider.ProviderId,
            ManufacturerId = manufacturerId,
            DeviceTypeId = chairType.DeviceTypeId,
            DeviceModelId = chairModel.DeviceModelId,
            ValidFrom = new DateOnly(2023, 1, 1),
            ValidTo = null
        };

        var providerCertInstr = new SqlProviderCertification
        {
            CertificationId = Guid.NewGuid(),
            ProviderId = provider.ProviderId,
            ManufacturerId = manufacturerId,
            DeviceTypeId = instrumentType.DeviceTypeId,
            DeviceModelId = null,
            ValidFrom = new DateOnly(2023, 1, 1),
            ValidTo = new DateOnly(2026, 12, 31)
        };

        var warrantyDefinition = new SqlWarrantyDefinition
        {
            WarrantyDefId = Guid.Parse("ffffffff-ffff-ffff-ffff-ffffffffffff"),
            ManufacturerId = manufacturerId,
            Name = "12 Month Standard",
            DurationMonths = 12,
            Coverages = new List<SqlWarrantyDefinitionCoverage>
            {
                new SqlWarrantyDefinitionCoverage { ServiceTypeId = serviceTypePm.ServiceTypeId },
                new SqlWarrantyDefinitionCoverage { ServiceTypeId = serviceTypeRepair.ServiceTypeId }
            }
        };

        var clinicId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var chairDevice = new SqlDevice
        {
            DeviceId = Guid.Parse("88888888-8888-8888-8888-888888888888"),
            ClinicId = clinicId,
            ManufacturerId = manufacturerId,
            DeviceTypeId = chairType.DeviceTypeId,
            DeviceModelId = chairModel.DeviceModelId,
            Status = DeviceStatus.Active,
            InstalledAt = new DateTime(2023, 10, 1, 12, 0, 0, DateTimeKind.Utc),
            SerialNumber = "CHAIR-001",
            Notes = "Primary operatory chair",
            Spaces =
            {
                new SqlDeviceSpace
                {
                    SpaceId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                    Name = "Operatory 1",
                    Kind = "operatory"
                }
            }
        };

        var instrDevice = new SqlDevice
        {
            DeviceId = Guid.Parse("99999999-9999-9999-9999-999999999999"),
            ClinicId = clinicId,
            ManufacturerId = manufacturerId,
            DeviceTypeId = instrumentType.DeviceTypeId,
            DeviceModelId = instrModel.DeviceModelId,
            Status = DeviceStatus.Active,
            InstalledAt = new DateTime(2023, 5, 15, 12, 0, 0, DateTimeKind.Utc),
            SerialNumber = "INSTR-001"
        };

        var serviceEvent = new SqlServiceEvent
        {
            EventId = Guid.NewGuid(),
            DeviceId = chairDevice.DeviceId,
            ProviderId = provider.ProviderId,
            ServiceTypeId = serviceTypePm.ServiceTypeId,
            OccurredAt = new DateTime(2024, 6, 1, 15, 0, 0, DateTimeKind.Utc),
            SpaceId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            WarrantyContractId = Guid.Parse("12121212-1212-1212-1212-121212121212"),
            Parts = new List<SqlServiceEventPart>
            {
                new SqlServiceEventPart
                {
                    EventId = Guid.Empty, // will be replaced below
                    PartId = Guid.NewGuid(),
                    Quantity = 1,
                    LineCost = 1200m
                }
            }
        };

        foreach (var part in serviceEvent.Parts)
        {
            part.EventId = serviceEvent.EventId;
        }

        chairDevice.ServiceEvents.Add(serviceEvent);

        var warrantyContract = new SqlWarrantyContract
        {
            WarrantyContractId = Guid.Parse("12121212-1212-1212-1212-121212121212"),
            DeviceId = chairDevice.DeviceId,
            ManufacturerId = manufacturerId,
            WarrantyDefId = warrantyDefinition.WarrantyDefId,
            EffectiveOn = new DateOnly(2024, 1, 1),
            ExpiresOn = new DateOnly(2024, 12, 31),
            Status = "active"
        };

        await _dbContext.DeviceTypes.AddRangeAsync(new[] { chairType, instrumentType }, cancellationToken);
        await _dbContext.DeviceModels.AddRangeAsync(new[] { chairModel, instrModel }, cancellationToken);
        await _dbContext.ServiceTypes.AddRangeAsync(new[] { serviceTypePm, serviceTypeRepair }, cancellationToken);
        await _dbContext.Providers.AddAsync(provider, cancellationToken);
        await _dbContext.ProviderCertifications.AddRangeAsync(new[] { providerCertChair, providerCertInstr }, cancellationToken);
        await _dbContext.WarrantyDefinitions.AddAsync(warrantyDefinition, cancellationToken);
        await _dbContext.Devices.AddRangeAsync(new[] { chairDevice, instrDevice }, cancellationToken);
        await _dbContext.WarrantyContracts.AddAsync(warrantyContract, cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
