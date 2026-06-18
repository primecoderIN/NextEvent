namespace API.Services;

/// <summary>
/// Abstraction over the OpenAI API.
/// Keeps controllers and middleware free of OpenAI SDK details.
/// </summary>
public interface IOpenAiService
{
    /// <summary>
    /// Generates a rich, engaging event description using GPT.
    /// </summary>
    /// <param name="title">Event title (required).</param>
    /// <param name="category">Event category (e.g. Music, Technology).</param>
    /// <param name="city">City where the event takes place.</param>
    /// <param name="venue">Venue name.</param>
    /// <returns>Generated description string.</returns>
    Task<string> GenerateEventDescriptionAsync(
        string title,
        string category,
        string city,
        string venue,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Suggests the best matching category for a given event title.
    /// Returns one of the known category values or an empty string if unsure.
    /// </summary>
    /// <param name="title">Event title to classify.</param>
    /// <returns>Suggested category name, or empty string.</returns>
    Task<string> SuggestCategoryAsync(
        string title,
        CancellationToken cancellationToken = default);
}
