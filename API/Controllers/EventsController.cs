using Application.Events.Quaries;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Persistence;

namespace API.Controllers;

public class EventsController(AppDBContext context, IMediator mediator): BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<Event>>> GetEvents()
    {
        return await mediator.Send(new GetEventsList.Query());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Event>> GetActivityById(string id)
    {
        //Event is reserved keyword so using _event
        var _event = await context.Events.FindAsync(id);

        if(_event==null){
        return NotFound();
    }
        return Ok(_event);
    }
    
}