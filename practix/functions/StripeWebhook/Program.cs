using Microsoft.Azure.Functions.Worker.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Stripe;
using StripeWebhook;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureAppConfiguration((hostingContext, config) =>
    {
        config.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
              .AddJsonFile($"appsettings.{hostingContext.HostingEnvironment.EnvironmentName}.json", optional: true)
              .AddEnvironmentVariables();
    })
    .ConfigureServices((context, services) =>
    {
        var stripeSecret = context.Configuration["STRIPE_SECRET_KEY"] ?? string.Empty;
        var sqlConnection = context.Configuration["SQLCONN"] ?? string.Empty;
        var storageConnection = context.Configuration["STORAGE_CONNECTION"];

        services.Configure<StripeOptions>(options =>
        {
            options.SecretKey = stripeSecret;
            options.WebhookSecret = context.Configuration["STRIPE_WEBHOOK_SECRET"] ?? string.Empty;
            options.PriceId = context.Configuration["STRIPE_PRICE_ID"] ?? string.Empty;
        });

        StripeConfiguration.ApiKey = stripeSecret;

        services.AddSingleton(new SqlConnectionFactory(sqlConnection));
        if (!string.IsNullOrWhiteSpace(storageConnection))
        {
            services.AddSingleton(new Azure.Storage.Files.DataLake.DataLakeServiceClient(storageConnection));
        }
        else
        {
            services.AddSingleton<Azure.Storage.Files.DataLake.DataLakeServiceClient?>(_ => null);
        }

        services.AddSingleton<EventRepository>();
        services.AddSingleton<EntitlementService>();
        services.AddLogging(builder => builder.AddConsole());
    })
    .Build();

host.Run();
