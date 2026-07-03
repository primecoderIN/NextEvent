// using MediatR;
// using Application.Core.Interfaces;

namespace Application.Events.Commands.CreateEvent;

// Injecting the interface IAppDBContext instead of AppDBContext 
// adheres to Clean Architecture Dependency Inversion.
// Injecting ICurrentUserService instead of HttpContext decouples this handler from
// HTTP concerns and makes it testable without a request context.
public class CreateEventCommandHandler(IAppDBContext context, ICurrentUserService currentUserService) : IRequestHandler<CreateEventCommand, Guid>
{
    public async Task<Guid> Handle(
        CreateEventCommand request,
        CancellationToken cancellationToken)
    {
        // Get the current authenticated user ID through the abstraction.
        // This will be used for authorization checks or to associate the event with its creator.
        var currentUserId = currentUserService.GetCurrentUserId();

        var eventEntity = new Domain.Event
        {
            Id = Guid.NewGuid(),
            Title = request.Event.Title,
            Description = request.Event.Description,
            Category = request.Event.Category,
            Date = request.Event.Date,
            City = request.Event.City,
            Venue = request.Event.Venue,
            Latitude = request.Event.Latitude,
            Longitude = request.Event.Longitude
        };

        context.Events.Add(eventEntity);
        await context.SaveChangesAsync(cancellationToken);

        return eventEntity.Id;
    }
}
