using MediatR;
using Domain;
using Persistence;

namespace Application.Events.Commands;

public class CreateEvent {

    public class Command : IRequest<string>
    {
      public required Event Event {get;set;}
    }

    public class Handler(AppDBContext context) : IRequestHandler<Command, string>
    {
       public async Task<string> Handle(Command request, CancellationToken cancellationToken)
        {
            context.Events.Add(request.Event);

            await context.SaveChangesAsync(cancellationToken);

            return request.Event.Id;
        }
    }
} 