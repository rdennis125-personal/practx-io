using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Practx.Equipment.Api.Data;
using Practx.Equipment.Api.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureAppConfiguration(builder =>
    {
        builder.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
        builder.AddEnvironmentVariables();
    })
    .ConfigureServices((context, services) =>
    {
        services.Configure<EquipmentDatabaseOptions>(context.Configuration.GetSection("EquipmentDatabase"));
        services.AddSingleton<EquipmentDatabase>();
        services.AddSingleton<IEquipmentRepository, SqliteEquipmentRepository>();
        services.AddSingleton<IEquipmentService, EquipmentService>();
        services.AddHostedService<EquipmentMigrationHostedService>();
        services.AddSingleton(new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true,
            WriteIndented = true,
        });
    })
    .Build();

host.Run();
