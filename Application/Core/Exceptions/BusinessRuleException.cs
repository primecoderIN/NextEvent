namespace Application.Core.Exceptions;

/// <summary>
/// Thrown by a MediatR handler when a domain business rule is violated
/// (e.g. "Cannot register for a cancelled event").
/// The ExceptionMiddleware in the API layer maps this to HTTP 409 Conflict.
/// Kept in the Application layer to preserve Clean Architecture —
/// no ASP.NET Core dependency required here.
/// </summary>
public class BusinessRuleException(string message) : Exception(message);
