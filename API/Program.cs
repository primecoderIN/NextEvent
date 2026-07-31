using API.Extensions;
using API.Middleware;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NextEvent.Modules.Identity.Persistence;
using NextEvent.Modules.Identity.Domain;
using API;

// =======================================================================
// API LAYER (Program.cs)
// This is the Composition Root of the application. It acts as the entry point 
// and wires up all dependencies across the Modules and Shared layers.
// It configures the HTTP request pipeline, Middleware, Authentication, and Swagger.
// =======================================================================

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddApiServices();
builder.Services.AddDatabaseServices(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddSwaggerServices();
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddMassTransitServices(builder.Configuration);

var app = builder.Build();

// Enable Swagger only in Development environment
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// -----------------------------------------------------------------------
// Global exception handling middleware
// -----------------------------------------------------------------------
app.UseCors("CorsPolicy"); //Enable CORS with the defined policy.
app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

// Configure the HTTP request pipeline.
app.MapControllers(); //When an HTTP request arrives, route it to controller actions.

// Run migrations for the DbContexts (basic approach for now)
using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var identityContext = services.GetRequiredService<IdentityDbContext>();
    var orgContext = services.GetRequiredService<NextEvent.Modules.Organizations.Persistence.Contexts.OrganizationsDbContext>();
    var eventsContext = services.GetRequiredService<NextEvent.Modules.Events.Persistence.Contexts.EventsDbContext>();
    
    // Automatically apply migrations for all modules
    identityContext.Database.Migrate();
    orgContext.Database.Migrate();
    eventsContext.Database.Migrate();
    
    // We use our custom Domain.User class (which extends IdentityUser with app-specific properties).
    var userManager = services.GetRequiredService<UserManager<User>>();
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
    
    // Seed initial data
    await DatabaseInitializer.SeedData(identityContext, orgContext, eventsContext, roleManager, userManager); 
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occured during initialization");
}

app.Run();
