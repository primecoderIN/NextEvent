using NextEvent.Modules.Events.Application.Events.Commands.CreateEvent;
using NextEvent.Modules.Events.Application.Events.Queries.GetEventsList;
using NextEvent.Modules.Organizations.Application.Organizations.Commands.CreateOrganization;
using NextEvent.Modules.Organizations.Application.Organizations.Queries.GetOrganizationById;
using NextEvent.Modules.Identity.Application.Authentication.Commands.Register;
using NextEvent.Modules.Identity.Application.Authentication.Commands.Login;
using NextEvent.Modules.AI.Application.Interfaces;
using NextEvent.Modules.AI.Application.Services;
using FluentValidation;

namespace API.Extensions;

/// <summary>
/// Responsibility: Configures services strictly belonging to the Application and Domain logic layer.
/// This includes registering CQRS handlers (MediatR), validation pipelines (FluentValidation),
/// and core business integrations like the Gemini service.
/// </summary>
public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // FluentValidation: Scans the specified project assemblies and registers all Validation classes it finds.
        // Because this is a Modular Monolith, we have to tell it to scan the Events, Organizations, and Identity modules separately.
        services.AddValidatorsFromAssemblyContaining<CreateEventCommandValidator>();
        services.AddValidatorsFromAssemblyContaining<CreateOrganizationCommandValidator>();
        services.AddValidatorsFromAssemblyContaining<RegisterCommandValidator>();
        
        // Registers a strongly-typed HttpClient specifically for the GeminiService, allowing it to make external API calls.
        services.AddHttpClient<IGeminiService, GeminiService>();
        
        // Registers a global, single instance (Singleton) of a DateTime provider. 
        // We use this instead of DateTime.UtcNow directly so we can easily mock the clock during unit testing.
        services.AddSingleton<NextEvent.Shared.Interfaces.IDateTimeProvider, NextEvent.Shared.Providers.SystemDateTimeProvider>();

        // Configures MediatR, the library we use to implement the CQRS (Command Query Responsibility Segregation) pattern.
        services.AddMediatR(x =>
        {
            // Tells MediatR to scan these specific module assemblies and register all Command/Query Handlers it finds.
            x.RegisterServicesFromAssemblyContaining<GetEventsListQueryHandler>();
            x.RegisterServicesFromAssemblyContaining<GetOrganizationByIdQueryHandler>();
            x.RegisterServicesFromAssemblyContaining<LoginCommandHandler>();
            
            // MediatR Pipeline Behavior (Middleware): MediatR and FluentValidation are two completely separate libraries.
            // MediatR knows nothing about the validators we registered above. This "ValidationBehavior" acts as a bridge.
            // It tells MediatR: "Before executing any handler, check the DI container for any FluentValidation rules that match this command, and run them first."
            x.AddOpenBehavior(typeof(NextEvent.Shared.ValidationBehavior<,>));
        });

        return services;
    }
}
