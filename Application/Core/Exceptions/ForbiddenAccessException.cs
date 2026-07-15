namespace Application.Core.Exceptions;

/// <summary>
/// Exception thrown when a user is authenticated but does not have the required
/// permissions to perform an action (maps to HTTP 403 Forbidden).
/// </summary>
public class ForbiddenAccessException : Exception
{
    public ForbiddenAccessException() : base("You do not have permission to access this resource.") { }

    public ForbiddenAccessException(string message) : base(message) { }
}
