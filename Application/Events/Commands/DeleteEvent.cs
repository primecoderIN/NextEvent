using MediatR;
using Persistence;

namespace Application.Events.Commands;

public class DeleteEvent
{
    public class Command : IRequest<bool>
    {
        public required string Id {get;set;}
    }

    public class Handler(AppDBContext context) : IRequestHandler<Command,bool>
    {
        public async Task<bool> Handle(Command request, CancellationToken cancellationToken)
        {
             var eventEntity = await context.Events.FindAsync([request.Id], cancellationToken);

               if (eventEntity is null)
            {
                return false;
            }

            context.Remove(eventEntity);

            await context.SaveChangesAsync(cancellationToken);

            return true;
        }


    }
}