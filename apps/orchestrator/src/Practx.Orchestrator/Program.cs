using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Practx.Orchestrator.Options;
using Practx.Orchestrator.Services;

var host = new HostBuilder()
    .ConfigureAppConfiguration((context, builder) =>
    {
        builder.AddJsonFile("local.settings.json", optional: true, reloadOnChange: true);
        builder.AddEnvironmentVariables();
    })
    .ConfigureServices((context, services) =>
    {
        services.AddOptions<WorkflowOptions>().Configure<IConfiguration>((options, config) =>
        {
            options.StripeTestKey = config["STRIPE_TEST_KEY"] ?? string.Empty;
            options.ResolveTestKey = config["RESOLVE_TEST_KEY"] ?? string.Empty;
            options.ServiceBusConnection = config["SERVICE_BUS_CONNECTION"] ?? string.Empty;
            options.AutoReleaseDays = int.TryParse(config["AUTO_RELEASE_DAYS"], out var autoRelease) ? autoRelease : options.AutoReleaseDays;
            options.DealerTimeoutMinutes = int.TryParse(config["DEALER_TIMEOUT_MINUTES"], out var timeout) ? timeout : options.DealerTimeoutMinutes;
            options.AckUrlBase = config["ACK_URL_BASE"] ?? string.Empty;
            options.WebhookHmacSecret = config["WEBHOOK_HMAC_SECRET"] ?? string.Empty;
            options.MockDealerDelaySeconds = int.TryParse(config["MOCK_DEALER_DELAY_SECONDS"], out var delay) ? delay : options.MockDealerDelaySeconds;
        });
        services.AddLogging();
        services.AddSingleton<IOrderRepository, InMemoryOrderRepository>();
        services.AddSingleton<IAckTokenService, AckTokenService>();
        services.AddSingleton<ISignatureService, HmacSignatureService>();
        services.AddSingleton<IDateTimeProvider, SystemDateTimeProvider>();
        services.AddSingleton<IDealerClient, MockDealerClient>();
        services.AddSingleton<IResolveClient, MockResolveClient>();
        services.AddSingleton<IStripeConnectClient, MockStripeConnectClient>();
        services.AddSingleton<IOrderWorkflowService, OrderWorkflowService>();
    })
    .ConfigureFunctionsWorkerDefaults();

await host.Build().RunAsync();
