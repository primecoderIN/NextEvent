using Domain;
using MediatR;

namespace Application.Events.Queries.GetEventDetailsById;

public class GetEventDetailsByIdQuery : IRequest<Event>
{
    public required Guid Id { get; set; }
}
