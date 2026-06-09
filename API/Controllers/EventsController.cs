using Application.Events.Quaries;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers;

public class EventsController( IMediator mediator): BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<Event>>> GetEvents()
    {
        return await mediator.Send(new GetEventsList.Query());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Event>> GetActivityById(string id)
    {
       return await mediator.Send(new GetEventDetailsById.Query{Id=id});
    }
    
}