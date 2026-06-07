using Microsoft.EntityFrameworkCore;
using Domain;

namespace Persistence;

public class AppDBContext(DbContextOptions options): DbContext(options) //Whatever options we passed from program.cs has to be passed to DbContext
{
    public DbSet<Event> Events { get; set; }
}