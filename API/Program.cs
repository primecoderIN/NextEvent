using API.Extensions;
using API.Middleware;
using Microsoft.EntityFrameworkCore;
using Persistence;

// =======================================================================
// API LAYER (Program.cs)
// This is the Composition Root of the application. It acts as the entry point 
// and wires up all dependencies across the Domain, Application, and Persistence layers.
// It configures the HTTP request pipeline, Middleware, Authentication, and Swagger.
// =======================================================================

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddApiServices();
builder.Services.AddDatabaseServices(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddSwaggerServices();
builder.Services.AddIdentityServices(builder.Configuration);

var app = builder.Build();

// Enable Swagger only in Development environment
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// -----------------------------------------------------------------------
// Global exception handling middleware
// Must be the FIRST middleware registered so it wraps the entire pipeline.
// Replaces the previous inline app.Use(async (context, next) => …) lambda.
// Handles: ValidationException → 400, NotFoundException → 404,
//          BusinessRuleException → 409, Exception → 500
// All responses use the ApiResponse<T> envelope.
// -----------------------------------------------------------------------
app.UseCors("CorsPolicy"); //Enable CORS with the defined policy.
app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();


// Configure the HTTP request pipeline.
app.MapControllers(); //When an HTTP request arrives, route it to controller actions.



//There is no scope before app.Run(), so manually creating scope to do migrations
using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var context = services.GetRequiredService<AppDBContext>();
    var roleManager = services.GetRequiredService<Microsoft.AspNetCore.Identity.RoleManager<Microsoft.AspNetCore.Identity.IdentityRole>>();
    var userManager = services.GetRequiredService<Microsoft.AspNetCore.Identity.UserManager<Domain.User>>();
    await context.Database.MigrateAsync();  //pending migration will be done //DB will be created if not created
    await DBInitializer.SeedData(context, roleManager, userManager); //Update data in database.
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occured during migration");
}

app.Run();
