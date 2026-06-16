using Application.Core;
using Application.Events.Quaries;
using Application.Events.Validators;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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
builder.Services.AddValidatorsFromAssemblyContaining<CreateEventValidator>();

builder.Services.AddDbContext<AppDBContext>(options =>
{
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.AllowAnyHeader()
                .AllowAnyMethod()
                .WithOrigins("http://localhost:3001");
    });
});

builder.Services.AddMediatR(x=>
{
    x.RegisterServicesFromAssemblyContaining<GetEventsList.Handler>();
    // Automatically run FluentValidation for every command/query in the pipeline
    x.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
});


var app = builder.Build();

// Enable Swagger only in Development environment
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Global exception handling middleware — must be registered before other middleware
app.Use(async (context, next) =>
{
    try
    {
        await next(context);
    }
    catch (ValidationException ex)
    {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        context.Response.ContentType = "application/json";

        var errors = ex.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(
                g => g.Key,
                g => g.Select(e => e.ErrorMessage).ToArray()
            );

        await context.Response.WriteAsJsonAsync(new { errors });
    }
    catch (Exception ex)
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { error = ex.Message });
    }
});

app.UseCors("CorsPolicy"); //Enable CORS with the defined policy.

// Configure the HTTP request pipeline.
app.MapControllers(); //When an HTTP request arrives, route it to controller actions.



//There is no scope before app.Run(), so manually creating scope to do migrations
using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var context = services.GetRequiredService<AppDBContext>();
    await context.Database.MigrateAsync();  //pending migration will be done //DB will be created if not created
    await DBInitializer.SeedData(context); //Update data in database.
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occured during migration");
}

app.Run();
