using Application.Events.Commands;
using Application.Events.DTOs;
using Application.Events.Quaries;
using Domain;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers;

public class EventsController: BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<Event>>> GetEvents(CancellationToken cancellationToken)
    {
        return await Mediator.Send(new GetEventsList.Query(), cancellationToken);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Event>> GetActivityById(string id, CancellationToken cancellationToken)
    {
       var _event = await Mediator.Send(new GetEventDetailsById.Query{Id=id}, cancellationToken);

        if (_event == null)
        {
            return NotFound();
        }

        return Ok(_event);
    }

   [HttpPost]
    public async Task<ActionResult<object>> CreateNewEvent([FromBody] CreateEventDto _event, CancellationToken cancellationToken)
    {
         var id = await Mediator.Send(new CreateEvent.Command { Event = _event }, cancellationToken);

         return Ok(new
            {
              Id = id
            });
    }

   [HttpPut("{id}")]
   public async Task<ActionResult> UpdateEvent(string id, [FromBody] UpdateEventDto dto, CancellationToken cancellationToken)
   {
       var updated = await Mediator.Send(new EditEvent.Command { Id = id, EventData = dto }, cancellationToken);

       if (!updated)
       {
           return NotFound();
       }

       return NoContent();
   }

   [HttpDelete("{id}")]
   public async Task<ActionResult> DeleteEvent(string id, CancellationToken cancellationToken)
    {
        var itemDeleted = await Mediator.Send(new DeleteEvent.Command{Id=id}, cancellationToken);

        if (!itemDeleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    
}
