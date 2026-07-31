namespace NextEvent.Shared.Common;

/// <summary>
/// Standard JSON envelope returned by every API endpoint.
/// The frontend can always safely deserialize every response
/// into this shape regardless of operation type or outcome.
/// </summary>
/// <typeparam name="T">The type of the payload carried in <see cref="Data"/>.</typeparam>
public class ApiResponse<T>
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public T? Data { get; init; }
    public Dictionary<string, string[]> Errors { get; init; } = [];
}

/// <summary>
/// Non-generic static factory that creates <see cref="ApiResponse{T}"/> instances
/// with sensible defaults, keeping controller actions lean.
/// </summary>
public static class ApiResponse
{
    // -----------------------------------------------------------------------
    // Success factories
    // -----------------------------------------------------------------------

    /// <summary>Wraps a successful payload with HTTP 200 semantics.</summary>
    public static ApiResponse<T> Ok<T>(T data, string message = "Request completed successfully") =>
        new()
        {
            Success = true,
            Message = message,
            Data = data,
            Errors = []
        };

    /// <summary>Wraps a successful creation payload with HTTP 201 semantics.</summary>
    public static ApiResponse<T> Created<T>(T data, string message = "Resource created successfully") =>
        new()
        {
            Success = true,
            Message = message,
            Data = data,
            Errors = []
        };

    // -----------------------------------------------------------------------
    // Failure factories
    // -----------------------------------------------------------------------

    /// <summary>
    /// Builds a failure envelope. Used by the middleware for all error scenarios.
    /// </summary>
    public static ApiResponse<object> Fail(
        string message,
        Dictionary<string, string[]>? errors = null) =>
        new()
        {
            Success = false,
            Message = message,
            Data = null,
            Errors = errors ?? []
        };
}
