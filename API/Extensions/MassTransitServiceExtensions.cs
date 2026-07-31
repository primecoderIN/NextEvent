using NextEvent.Modules.Identity.Persistence;
using NextEvent.Modules.Organizations.Persistence.Contexts;
using NextEvent.Modules.Events.Persistence.Contexts;
using MassTransit;

namespace API.Extensions;

public static class MassTransitServiceExtensions
{
    public static IServiceCollection AddMassTransitServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddMassTransit(x =>
        {
            // Configure Entity Framework Outbox for the Identity module
            x.AddEntityFrameworkOutbox<IdentityDbContext>(o =>
            {
                o.UseSqlServer();
                o.UseBusOutbox();
            });

            // Configure Entity Framework Outbox for the Organizations module
            // DisableDeliveryService: no consumers are bound to this context yet;
            // the outbox tables are created for future use but the background
            // delivery worker (which requires an initialized BusOutboxNotification)
            // is not started to avoid a NullReferenceException at startup.
            x.AddEntityFrameworkOutbox<OrganizationsDbContext>(o =>
            {
                o.UseSqlServer();
                o.UseBusOutbox(b => b.DisableDeliveryService());
            });

            // Configure Entity Framework Outbox for the Events module
            x.AddEntityFrameworkOutbox<EventsDbContext>(o =>
            {
                o.UseSqlServer();
                o.UseBusOutbox(b => b.DisableDeliveryService());
            });

            // Set endpoint name formatter
            x.SetKebabCaseEndpointNameFormatter();

            // Configure RabbitMQ as the transport
            x.UsingRabbitMq((context, cfg) =>
            {
                var rabbitHost = configuration["RabbitMQ:Host"] ?? "localhost";
                
                cfg.Host(rabbitHost, "/", h =>
                {
                    h.Username(configuration["RabbitMQ:Username"] ?? "guest");
                    h.Password(configuration["RabbitMQ:Password"] ?? "guest");
                });

                cfg.ConfigureEndpoints(context);
            });
        });

        return services;
    }
}
