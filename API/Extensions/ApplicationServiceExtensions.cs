using API.Services;
using Application.Events.Commands.CreateEvent;
using Application.Events.Queries.GetEventsList;
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
        services.AddHttpClient<IGeminiService, GeminiService>();

        services.AddMediatR(x =>
        {
            x.RegisterServicesFromAssemblyContaining<GetEventsListQueryHandler>();
            x.AddOpenBehavior(typeof(Application.Core.ValidationBehavior<,>));
        });

        return services;
    }
}
