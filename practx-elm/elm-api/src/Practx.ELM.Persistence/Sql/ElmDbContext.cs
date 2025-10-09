using Microsoft.EntityFrameworkCore;
using Practx.ELM.Domain.ValueObjects;

namespace Practx.ELM.Persistence.Sql;

public class ElmDbContext : DbContext
{
    public ElmDbContext(DbContextOptions<ElmDbContext> options) : base(options)
    {
    }

    public DbSet<SqlDevice> Devices => Set<SqlDevice>();
    public DbSet<SqlDeviceType> DeviceTypes => Set<SqlDeviceType>();
    public DbSet<SqlDeviceModel> DeviceModels => Set<SqlDeviceModel>();
    public DbSet<SqlServiceType> ServiceTypes => Set<SqlServiceType>();
    public DbSet<SqlProvider> Providers => Set<SqlProvider>();
    public DbSet<SqlProviderCertification> ProviderCertifications => Set<SqlProviderCertification>();
    public DbSet<SqlWarrantyDefinition> WarrantyDefinitions => Set<SqlWarrantyDefinition>();
    public DbSet<SqlWarrantyDefinitionCoverage> WarrantyDefinitionCoverages => Set<SqlWarrantyDefinitionCoverage>();
    public DbSet<SqlWarrantyContract> WarrantyContracts => Set<SqlWarrantyContract>();
    public DbSet<SqlServiceEvent> ServiceEvents => Set<SqlServiceEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SqlDevice>(builder =>
        {
            builder.HasKey(d => d.DeviceId);
            builder.Property(d => d.Status).HasConversion<string>();
            builder.HasMany(d => d.Spaces).WithOne().HasForeignKey(s => s.DeviceId);
            builder.HasMany(d => d.ServiceEvents).WithOne().HasForeignKey(e => e.DeviceId);
        });

        modelBuilder.Entity<SqlDeviceSpace>(builder =>
        {
            builder.HasKey(s => s.SpaceId);
        });

        modelBuilder.Entity<SqlServiceEvent>(builder =>
        {
            builder.HasKey(e => e.EventId);
            builder.HasMany(e => e.Parts).WithOne().HasForeignKey(p => p.EventId);
        });

        modelBuilder.Entity<SqlServiceEventPart>(builder =>
        {
            builder.HasKey(p => new { p.EventId, p.PartId });
        });

        modelBuilder.Entity<SqlDeviceType>(builder => builder.HasKey(t => t.DeviceTypeId));
        modelBuilder.Entity<SqlDeviceModel>(builder => builder.HasKey(m => m.DeviceModelId));
        modelBuilder.Entity<SqlServiceType>(builder => builder.HasKey(st => st.ServiceTypeId));
        modelBuilder.Entity<SqlProvider>(builder => builder.HasKey(p => p.ProviderId));
        modelBuilder.Entity<SqlProviderCertification>(builder => builder.HasKey(pc => pc.CertificationId));
        modelBuilder.Entity<SqlWarrantyDefinition>(builder => builder.HasKey(w => w.WarrantyDefId));
        modelBuilder.Entity<SqlWarrantyDefinition>(builder =>
        {
            builder.HasMany(w => w.Coverages).WithOne().HasForeignKey(c => c.WarrantyDefId);
        });
        modelBuilder.Entity<SqlWarrantyContract>(builder => builder.HasKey(wc => wc.WarrantyContractId));
        modelBuilder.Entity<SqlWarrantyDefinitionCoverage>(builder => builder.HasKey(c => c.Id));
    }
}

public class SqlDevice
{
    public Guid DeviceId { get; set; }
    public Guid ClinicId { get; set; }
    public Guid ManufacturerId { get; set; }
    public Guid DeviceTypeId { get; set; }
    public Guid DeviceModelId { get; set; }
    public DeviceStatus Status { get; set; }
    public DateTime? InstalledAt { get; set; }
    public string? SerialNumber { get; set; }
    public string? Notes { get; set; }
    public List<SqlDeviceSpace> Spaces { get; set; } = new();
    public List<SqlServiceEvent> ServiceEvents { get; set; } = new();
}

public class SqlDeviceSpace
{
    public Guid SpaceId { get; set; }
    public Guid DeviceId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Kind { get; set; } = string.Empty;
}

public class SqlServiceEvent
{
    public Guid EventId { get; set; }
    public Guid DeviceId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid ServiceTypeId { get; set; }
    public DateTime OccurredAt { get; set; }
    public Guid? SpaceId { get; set; }
    public Guid? WarrantyContractId { get; set; }
    public List<SqlServiceEventPart> Parts { get; set; } = new();
}

public class SqlServiceEventPart
{
    public Guid PartId { get; set; }
    public Guid EventId { get; set; }
    public int Quantity { get; set; }
    public decimal? LineCost { get; set; }
}

public class SqlDeviceType
{
    public Guid DeviceTypeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool AllowsSpaceAssignments { get; set; }
}

public class SqlDeviceModel
{
    public Guid DeviceModelId { get; set; }
    public Guid DeviceTypeId { get; set; }
    public Guid ManufacturerId { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class SqlServiceType
{
    public Guid ServiceTypeId { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class SqlProvider
{
    public Guid ProviderId { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class SqlProviderCertification
{
    public Guid CertificationId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid ManufacturerId { get; set; }
    public Guid DeviceTypeId { get; set; }
    public Guid? DeviceModelId { get; set; }
    public DateOnly ValidFrom { get; set; }
    public DateOnly? ValidTo { get; set; }
}

public class SqlWarrantyDefinition
{
    public Guid WarrantyDefId { get; set; }
    public Guid ManufacturerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DurationMonths { get; set; }
    public List<SqlWarrantyDefinitionCoverage> Coverages { get; set; } = new();
}

public class SqlWarrantyDefinitionCoverage
{
    public int Id { get; set; }
    public Guid WarrantyDefId { get; set; }
    public Guid ServiceTypeId { get; set; }
}

public class SqlWarrantyContract
{
    public Guid WarrantyContractId { get; set; }
    public Guid DeviceId { get; set; }
    public Guid ManufacturerId { get; set; }
    public Guid WarrantyDefId { get; set; }
    public DateOnly EffectiveOn { get; set; }
    public DateOnly ExpiresOn { get; set; }
    public string Status { get; set; } = string.Empty;
}
