using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Practx.ELM.Domain.Ports;
using Practx.ELM.Persistence.Blob;
using Practx.ELM.Persistence.Sql;

namespace Practx.ELM.Persistence;

public static class PersistenceFactory
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        var kind = configuration.GetValue<string>("Persistence:Kind") ?? "Blob";

        if (string.Equals(kind, "Sql", StringComparison.OrdinalIgnoreCase))
        {
            services.AddDbContext<ElmDbContext>(options =>
            {
                var connectionString = configuration.GetValue<string>("Persistence:Sql:ConnectionString");
                if (string.IsNullOrWhiteSpace(connectionString))
                {
                    options.UseInMemoryDatabase("PractxElmSql");
                }
                else
                {
                    options.UseInMemoryDatabase("PractxElmSql");
                }
            });

            services.AddScoped<IDeviceRepository, SqlDeviceRepository>();
            services.AddScoped<IWarrantyRepository, SqlWarrantyRepository>();
            services.AddScoped<IServiceEventRepository, SqlServiceEventRepository>();
            services.AddScoped<ILookupRepository, SqlLookupRepository>();
            services.AddScoped<IPersistenceSeeder, SqlPersistenceSeeder>();
        }
        else
        {
            services.AddSingleton<BlobDataStore>();
            services.AddScoped<IDeviceRepository, BlobDeviceRepository>();
            services.AddScoped<IWarrantyRepository, BlobWarrantyRepository>();
            services.AddScoped<IServiceEventRepository, BlobServiceEventRepository>();
            services.AddScoped<ILookupRepository, BlobLookupRepository>();
            services.AddScoped<IPersistenceSeeder, BlobPersistenceSeeder>();
        }

        return services;
    }
}
