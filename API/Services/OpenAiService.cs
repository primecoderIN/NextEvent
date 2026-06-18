using OpenAI;
using OpenAI.Chat;

namespace API.Services;

/// <summary>
/// Concrete implementation of <see cref="IOpenAiService"/> backed by OpenAI's
/// Chat Completions API (gpt-4o-mini).
///
/// API key is read from configuration key "OpenAI:ApiKey".
/// In development, set it in appsettings.Development.json.
/// In production, use an environment variable: OPENAI__APIKEY
/// </summary>
public class OpenAiService(IConfiguration configuration, ILogger<OpenAiService> logger)
    : IOpenAiService
{
    // Known event categories — must stay in sync with the client-side CATEGORIES constant.
    private static readonly string[] KnownCategories =
    [
        "Music", "Technology", "Sports", "Art", "Food & Drink",
        "Business", "Health", "Education", "Networking", "Comedy",
        "Theatre", "Film", "Gaming", "Outdoor", "Other"
    ];

    // -----------------------------------------------------------------------
    // Shared helpers
    // -----------------------------------------------------------------------

    private ChatClient CreateChatClient()
    {
        var apiKey = configuration["OpenAI:ApiKey"]
            ?? throw new InvalidOperationException(
                "OpenAI API key is not configured. " +
                "Add 'OpenAI:ApiKey' to appsettings.Development.json " +
                "or set the OPENAI__APIKEY environment variable.");

        return new OpenAIClient(apiKey).GetChatClient("gpt-4o-mini");
    }

    // -----------------------------------------------------------------------
    // GenerateEventDescriptionAsync
    // -----------------------------------------------------------------------

    /// <inheritdoc/>
    public async Task<string> GenerateEventDescriptionAsync(
        string title,
        string category,
        string city,
        string venue,
        CancellationToken cancellationToken = default)
    {
        var client = CreateChatClient();

        var systemPrompt = """
            You are an expert event copywriter. Your job is to write compelling,
            engaging event descriptions that excite potential attendees.
            Keep descriptions between 80-150 words. Be vivid and enthusiastic.
            Do not include the event title or location in the description itself.
            Do not use bullet points. Write in flowing prose only.
            """;

        var userPrompt = $"""
            Write an event description for the following event:
            - Title: {title}
            - Category: {category}
            - City: {city}
            - Venue: {venue}
            """;

        try
        {
            var completion = await client.CompleteChatAsync(
                [
                    new SystemChatMessage(systemPrompt),
                    new UserChatMessage(userPrompt)
                ],
                new ChatCompletionOptions { MaxOutputTokenCount = 200 },
                cancellationToken);

            return completion.Value.Content[0].Text.Trim();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "OpenAI description generation failed for title '{Title}'", title);
            throw;
        }
    }

    // -----------------------------------------------------------------------
    // SuggestCategoryAsync
    // -----------------------------------------------------------------------

    /// <inheritdoc/>
    public async Task<string> SuggestCategoryAsync(
        string title,
        CancellationToken cancellationToken = default)
    {
        var client = CreateChatClient();

        var categoriesList = string.Join(", ", KnownCategories);

        var userPrompt = $"""
            Classify this event title into exactly one category from the list below.
            Respond with ONLY the category name. No explanation, no punctuation.

            Categories: {categoriesList}

            Event title: "{title}"
            """;

        try
        {
            var completion = await client.CompleteChatAsync(
                [new UserChatMessage(userPrompt)],
                new ChatCompletionOptions { MaxOutputTokenCount = 10 },
                cancellationToken);

            var suggested = completion.Value.Content[0].Text.Trim();

            // Only return a value if it's one of the known categories
            return KnownCategories.Contains(suggested, StringComparer.OrdinalIgnoreCase)
                ? suggested
                : string.Empty;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "OpenAI category suggestion failed for title '{Title}'", title);
            // Fail gracefully — return empty string so the UI just hides the chip
            return string.Empty;
        }
    }
}
