using API.Extensions;
using API.Middleware;
using API.Services;
using Application.Core;
using Application.Events.Queries.GetEventsList;
using Application.Events.Commands.CreateEvent;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Application.Core.Interfaces;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

/* =======================
   Routing
   ======================= */
builder.Services.AddRouting(options =>
{
    options.LowercaseUrls = true;
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Serialize all JSON responses in camelCase to match TypeScript client expectations
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        // Always serialize DateTime as UTC ISO-8601 with Z suffix (Zulu format)
        options.JsonSerializerOptions.Converters.Add(new UtcDateTimeJsonConverter());
    });

// Register all validators in the assembly
builder.Services.AddValidatorsFromAssemblyContaining<CreateEventCommandValidator>();

builder.Services.AddDbContext<AppDBContext>(options =>
{
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Register IAppDBContext so that when Application handlers request it, 
// the DI container provides the concrete AppDBContext. This wires up Dependency Inversion.
builder.Services.AddScoped<IAppDBContext>(provider => provider.GetRequiredService<AppDBContext>());

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .WithOrigins("http://localhost:3001");
    });
});

/* =======================
   AI Services
   ======================= */
builder.Services.AddScoped<IOpenAiService, OpenAiService>();

builder.Services.AddMediatR(x=>
{
    x.RegisterServicesFromAssemblyContaining<GetEventsListQueryHandler>();

// Closed registration: explicitly maps IPipelineBehavior<,> to ValidationBehavior<,>
// x.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

// Open generic registration: MediatR automatically applies ValidationBehavior<TRequest,TResponse>
// to every request/response pair
x.AddOpenBehavior(typeof(ValidationBehavior<,>));
});


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
