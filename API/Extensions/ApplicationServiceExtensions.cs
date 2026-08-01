using NextEvent.Modules.Events.Application.Events.Commands.CreateEvent;
using NextEvent.Modules.Events.Application.Events.Queries.GetEventsList;
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
        services.AddValidatorsFromAssemblyContaining<CreateEventCommandValidator>();
        services.AddValidatorsFromAssemblyContaining<NextEvent.Modules.Organizations.Application.Organizations.Commands.CreateOrganization.CreateOrganizationCommandValidator>();
        services.AddValidatorsFromAssemblyContaining<NextEvent.Modules.Identity.Application.Authentication.Commands.Register.RegisterCommandValidator>();
        services.AddHttpClient<IGeminiService, GeminiService>();

        services.AddMediatR(x =>
        {
            x.RegisterServicesFromAssemblyContaining<GetEventsListQueryHandler>();
            x.RegisterServicesFromAssemblyContaining<NextEvent.Modules.Organizations.Application.Organizations.Queries.GetOrganizationById.GetOrganizationByIdQueryHandler>();
            x.RegisterServicesFromAssemblyContaining<NextEvent.Modules.Identity.Application.Authentication.Commands.Login.LoginCommandHandler>();
            x.AddOpenBehavior(typeof(NextEvent.Shared.ValidationBehavior<,>));
        });

        return services;
    }
}
