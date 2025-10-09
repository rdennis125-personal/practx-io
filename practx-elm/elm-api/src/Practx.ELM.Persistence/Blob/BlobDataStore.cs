using Practx.ELM.Domain.Entities;
using Practx.ELM.Domain.ValueObjects;

namespace Practx.ELM.Persistence.Blob;

internal sealed class BlobDataStore
{
    private readonly object _sync = new();
    private bool _seeded;

    private readonly List<BlobDeviceEntity> _devices = new();
    private readonly List<BlobDeviceSpaceEntity> _deviceSpaces = new();
    private readonly List<BlobServiceEventEntity> _serviceEvents = new();
    private readonly List<DeviceType> _deviceTypes = new();
    private readonly List<DeviceModel> _deviceModels = new();
    private readonly List<ServiceType> _serviceTypes = new();
    private readonly List<Provider> _providers = new();
    private readonly List<ProviderCertification> _providerCertifications = new();
    private readonly List<WarrantyDefinition> _warrantyDefinitions = new();
    private readonly List<WarrantyContract> _warrantyContracts = new();

    public void EnsureSeeded()
    {
        lock (_sync)
        {
            if (_seeded)
            {
                return;
            }

            SeedInternal();
            _seeded = true;
        }
    }

    private void SeedInternal()
    {
        var manufacturerId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var chairType = new DeviceType(Guid.Parse("44444444-4444-4444-4444-444444444444"), "Chair", allowsSpaceAssignments: true);
        var instrumentType = new DeviceType(Guid.Parse("55555555-5555-5555-5555-555555555555"), "Instrument", allowsSpaceAssignments: false);
        _deviceTypes.AddRange(new[] { chairType, instrumentType });

        var chairModel = new DeviceModel(Guid.Parse("66666666-6666-6666-6666-666666666666"), chairType.DeviceTypeId, manufacturerId, "Standard Chair");
        var instrModel = new DeviceModel(Guid.Parse("77777777-7777-7777-7777-777777777777"), instrumentType.DeviceTypeId, manufacturerId, "Standard Instrument");
        _deviceModels.AddRange(new[] { chairModel, instrModel });

        _serviceTypes.AddRange(new[]
        {
            new ServiceType(Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"), "Preventative Maintenance"),
            new ServiceType(Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"), "Repair")
        });

        _providers.Add(new Provider(Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"), "Provider Alpha"));
        _providerCertifications.Add(new ProviderCertification(
            certificationId: Guid.NewGuid(),
            providerId: Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
            manufacturerId: manufacturerId,
            deviceTypeId: chairType.DeviceTypeId,
            deviceModelId: chairModel.DeviceModelId,
            validFrom: new DateOnly(2023, 1, 1),
            validTo: null));

        _providerCertifications.Add(new ProviderCertification(
            certificationId: Guid.NewGuid(),
            providerId: Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
            manufacturerId: manufacturerId,
            deviceTypeId: instrumentType.DeviceTypeId,
            deviceModelId: null,
            validFrom: new DateOnly(2023, 1, 1),
            validTo: new DateOnly(2026, 12, 31)));

        var clinicId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        _devices.AddRange(new[]
        {
            new BlobDeviceEntity(
                Guid.Parse("88888888-8888-8888-8888-888888888888"),
                clinicId,
                manufacturerId,
                chairType.DeviceTypeId,
                chairModel.DeviceModelId,
                DeviceStatus.Active,
                new DateTime(2023, 10, 1, 12, 0, 0, DateTimeKind.Utc),
                "CHAIR-001",
                "Primary operatory chair"),
            new BlobDeviceEntity(
                Guid.Parse("99999999-9999-9999-9999-999999999999"),
                clinicId,
                manufacturerId,
                instrumentType.DeviceTypeId,
                instrModel.DeviceModelId,
                DeviceStatus.Active,
                new DateTime(2023, 5, 15, 12, 0, 0, DateTimeKind.Utc),
                "INSTR-001",
                null)
        });

        _deviceSpaces.Add(new BlobDeviceSpaceEntity(
            Guid.Parse("88888888-8888-8888-8888-888888888888"),
            Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            "Operatory 1",
            "operatory"));

        var warrantyDef = new WarrantyDefinition(
            Guid.Parse("ffffffff-ffff-ffff-ffff-ffffffffffff"),
            manufacturerId,
            "12 Month Standard",
            new[]
            {
                Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
                Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee")
            },
            durationMonths: 12);
        _warrantyDefinitions.Add(warrantyDef);

        _warrantyContracts.Add(new WarrantyContract(
            Guid.Parse("12121212-1212-1212-1212-121212121212"),
            deviceId: Guid.Parse("88888888-8888-8888-8888-888888888888"),
            manufacturerId: manufacturerId,
            warrantyDefId: warrantyDef.WarrantyDefId,
            effectiveOn: new DateOnly(2024, 1, 1),
            expiresOn: new DateOnly(2024, 12, 31),
            status: "active"));

        _serviceEvents.Add(new BlobServiceEventEntity(
            Guid.NewGuid(),
            Guid.Parse("88888888-8888-8888-8888-888888888888"),
            Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
            Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
            new DateTime(2024, 6, 1, 15, 0, 0, DateTimeKind.Utc),
            Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            Guid.Parse("12121212-1212-1212-1212-121212121212"),
            new List<ServicePart> { new ServicePart(Guid.NewGuid(), 1, 1200m) }));
    }

    public IReadOnlyList<DeviceType> GetDeviceTypes()
    {
        lock (_sync)
        {
            return _deviceTypes.ToList();
        }
    }

    public IReadOnlyList<DeviceModel> GetDeviceModels()
    {
        lock (_sync)
        {
            return _deviceModels.ToList();
        }
    }

    public IReadOnlyList<ServiceType> GetServiceTypes()
    {
        lock (_sync)
        {
            return _serviceTypes.ToList();
        }
    }

    public IReadOnlyList<Provider> GetProviders()
    {
        lock (_sync)
        {
            return _providers.ToList();
        }
    }

    public IReadOnlyList<ProviderCertification> GetProviderCertifications()
    {
        lock (_sync)
        {
            return _providerCertifications.ToList();
        }
    }

    public IReadOnlyList<WarrantyDefinition> GetWarrantyDefinitions()
    {
        lock (_sync)
        {
            return _warrantyDefinitions.ToList();
        }
    }

    public IReadOnlyList<WarrantyContract> GetWarrantyContracts()
    {
        lock (_sync)
        {
            return _warrantyContracts.ToList();
        }
    }

    public IReadOnlyList<BlobDeviceEntity> GetDevices()
    {
        lock (_sync)
        {
            return _devices.ToList();
        }
    }

    public IReadOnlyList<BlobDeviceSpaceEntity> GetDeviceSpaces()
    {
        lock (_sync)
        {
            return _deviceSpaces.ToList();
        }
    }

    public IReadOnlyList<BlobServiceEventEntity> GetServiceEvents()
    {
        lock (_sync)
        {
            return _serviceEvents.ToList();
        }
    }

    public void AddServiceEvent(BlobServiceEventEntity entity)
    {
        lock (_sync)
        {
            _serviceEvents.Add(entity);
        }
    }

    public void UpsertWarrantyContract(WarrantyContract contract)
    {
        lock (_sync)
        {
            var index = _warrantyContracts.FindIndex(c => c.WarrantyContractId == contract.WarrantyContractId);
            if (index >= 0)
            {
                _warrantyContracts[index] = contract;
            }
            else
            {
                _warrantyContracts.Add(contract);
            }
        }
    }

    public record BlobDeviceEntity(
        Guid DeviceId,
        Guid ClinicId,
        Guid ManufacturerId,
        Guid DeviceTypeId,
        Guid DeviceModelId,
        DeviceStatus Status,
        DateTime? InstalledAt,
        string? SerialNumber,
        string? Notes);

    public record BlobDeviceSpaceEntity(Guid DeviceId, Guid SpaceId, string Name, string Kind);

    public record BlobServiceEventEntity(
        Guid EventId,
        Guid DeviceId,
        Guid ProviderId,
        Guid ServiceTypeId,
        DateTime OccurredAt,
        Guid? SpaceId,
        Guid? WarrantyContractId,
        List<ServicePart> Parts);
}
