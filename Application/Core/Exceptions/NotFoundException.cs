namespace Application.Core.Exceptions;

/// <summary>
/// Thrown by a MediatR handler when a requested resource does not exist.
/// The ExceptionMiddleware in the API layer maps this to HTTP 404 Not Found.
/// Kept in the Application layer to preserve Clean Architecture —
/// no ASP.NET Core dependency required here.
/// </summary>
public class NotFoundException(string entityName, object key)
    : Exception($"{entityName} with id '{key}' was not found.");
