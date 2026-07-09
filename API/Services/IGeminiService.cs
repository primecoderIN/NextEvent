namespace API.Services;

/// <summary>
/// Abstraction over the Gemini API.
/// Keeps controllers and middleware free of Gemini SDK details.
/// </summary>
public interface IGeminiService
{
    /// <summary>
    /// Generates a compelling description for an event based on its core details.
    /// </summary>
    Task<string> GenerateEventDescriptionAsync(
        string title,
        string category,
        string city,
        string venue,
        CancellationToken cancellationToken = default);

}
