using Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Controllers;

public class EventsController(AppDBContext context): BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<Event>>> GetEvents()
    {
        return await context.Events.ToListAsync();
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