using API.Common;
using Application.Core.Exceptions;
using FluentValidation;

namespace API.Middleware;

/// <summary>
/// Centralized exception handling middleware.
/// Catches all exceptions thrown anywhere in the pipeline and
/// converts them into a consistent <see cref="ApiResponse{T}"/> JSON body.
///
/// Registration order matters — must be the first middleware registered
/// so it wraps everything downstream.
/// </summary>
public class ExceptionMiddleware(
    RequestDelegate next,
    ILogger<ExceptionMiddleware> logger,
    IHostEnvironment env)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ValidationException ex)
        {
            await HandleValidationExceptionAsync(context, ex);
        }
        catch (NotFoundException ex)
        {
            await HandleNotFoundExceptionAsync(context, ex);
        }
        catch (BusinessRuleException ex)
        {
            await HandleBusinessRuleExceptionAsync(context, ex);
        }
        catch (UnauthorizedException ex)
        {
            await HandleUnauthorizedExceptionAsync(context, ex);
        }
        catch (Exception ex)
        {
            await HandleUnexpectedExceptionAsync(context, ex);
        }
    }

    // -----------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------

    private static async Task HandleUnauthorizedExceptionAsync(
        HttpContext context,
        UnauthorizedException ex)
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        context.Response.ContentType = "application/json";

        var response = ApiResponse.Fail(ex.Message);
        await context.Response.WriteAsJsonAsync(response);
    }

    /// <summary>
    /// 400 Bad Request — FluentValidation failures grouped by property name.
    /// The errors dictionary maps each field to one or more error codes.
    /// </summary>
    private static async Task HandleValidationExceptionAsync(
        HttpContext context,
        ValidationException ex)
    {
        var errors = ex.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(
                g => g.Key,
                g => g.Select(e => e.ErrorMessage).ToArray()
            );

        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        context.Response.ContentType = "application/json";

        await context.Response.WriteAsJsonAsync(
            ApiResponse.Fail("Validation failed", errors));
    }

    /// <summary>
    /// 404 Not Found — thrown by handlers when a resource does not exist.
    /// </summary>
    private static async Task HandleNotFoundExceptionAsync(
        HttpContext context,
        NotFoundException ex)
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        context.Response.ContentType = "application/json";

        await context.Response.WriteAsJsonAsync(
            ApiResponse.Fail(ex.Message));
    }

    /// <summary>
    /// 409 Conflict — thrown by handlers when a domain business rule is violated.
    /// </summary>
    private static async Task HandleBusinessRuleExceptionAsync(
        HttpContext context,
        BusinessRuleException ex)
    {
        context.Response.StatusCode = StatusCodes.Status409Conflict;
        context.Response.ContentType = "application/json";

        await context.Response.WriteAsJsonAsync(
            ApiResponse.Fail(ex.Message));
    }

    /// <summary>
    /// 500 Internal Server Error — any unhandled exception.
    /// Full details are logged but never exposed to the client in production.
    /// </summary>
    private async Task HandleUnexpectedExceptionAsync(
        HttpContext context,
        Exception ex)
    {
        logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);

        // Surface the real message only in development so we never leak
        // internal details to production clients.
        var message = env.IsDevelopment()
            ? ex.Message
            : "An unexpected error occurred. Please try again later.";

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        await context.Response.WriteAsJsonAsync(
            ApiResponse.Fail(message));
    }
}
