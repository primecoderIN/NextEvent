using Application.Events.Quaries;
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
    
}