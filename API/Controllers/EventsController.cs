using Application.Events.Quaries;
using Application.Events.Commands;
using Domain;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers;

public class EventsController: BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<Event>>> GetEvents()
    {
        return await Mediator.Send(new GetEventsList.Query());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Event>> GetActivityById(string id)
    {
       var _event = await Mediator.Send(new GetEventDetailsById.Query{Id=id});

        if (_event == null)
        {
            return NotFound();
        }

        return Ok(_event);
    }

   [HttpPost]
    public async Task<ActionResult<object>> CreateNewEvent([FromBody] Event _event)
    {
         var id = await Mediator.Send(new CreateEvent.Command { Event = _event });

         return Ok(new
            {
              Id = id
            });
    }

   [HttpPut("{id}")]
   public async Task<ActionResult> UpdateEvent(string id, [FromBody] Event _event)
   {
        _event.Id = id;

        await Mediator.Send(new EditEvent.Command
         {
           Event = _event
         });

        return NoContent();
    }

    
}