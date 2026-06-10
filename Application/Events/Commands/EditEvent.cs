using System.Runtime.InteropServices;
using Domain;
using MediatR;
using Persistence;

namespace Application.Events.Commands;

public class EditEvent
{
    public class Command : IRequest //No Return
    {
        public required Event Event {get;set;}
    }

    public class Handler(AppDBContext context) : IRequestHandler<Command>
    {
        public async Task Handle(Command request, CancellationToken cancellationToken)
        {
            var Event = await context.Events.FindAsync([request.Event.Id], cancellationToken) ?? throw new Exception("Not found");

            Event.Title=request.Event.Title;

            await context.SaveChangesAsync(cancellationToken);
        }
    }
}