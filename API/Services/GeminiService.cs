using System.Text.Json;
using System.Text.Json.Serialization;

namespace API.Services;

public class GeminiService(HttpClient httpClient, IConfiguration configuration, ILogger<GeminiService> logger)
    : IGeminiService
{
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    private string GetApiKey()
    {
        return configuration["Gemini:ApiKey"]
            ?? throw new InvalidOperationException(
                "Gemini API key is not configured. " +
                "Add 'Gemini:ApiKey' to appsettings.Development.json " +
                "or set the GEMINI__APIKEY environment variable.");
    }

    private async Task<string> GenerateContentAsync(object requestData, string titleForLogging, CancellationToken cancellationToken)
    {
        var apiKey = GetApiKey();
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

        int maxRetries = 3;
        for (int i = 0; i < maxRetries; i++)
        {
            try
            {
                var response = await httpClient.PostAsJsonAsync(url, requestData, _jsonOptions, cancellationToken);
                
                if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests && i < maxRetries - 1)
                {
                    logger.LogWarning("Gemini API rate limit hit. Retrying in {Delay}s...", (i + 1) * 2);
                    await Task.Delay(TimeSpan.FromSeconds((i + 1) * 2), cancellationToken);
                    continue;
                }

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                    logger.LogError("Gemini API error: {StatusCode} {ErrorContent}", response.StatusCode, errorContent);
                    response.EnsureSuccessStatusCode();
                }

                var result = await response.Content.ReadFromJsonAsync<GeminiResponse>(_jsonOptions, cancellationToken);
                
                return result?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text?.Trim() ?? string.Empty;
            }
            catch (Exception ex)
            {
                // If we are out of retries, or if it's a 4xx client error (other than 429), don't retry.
                bool isClientError = ex is HttpRequestException httpEx && 
                                     (int?)httpEx.StatusCode >= 400 && 
                                     (int?)httpEx.StatusCode < 500 && 
                                     httpEx.StatusCode != System.Net.HttpStatusCode.TooManyRequests;

                if (i == maxRetries - 1 || isClientError)
                {
                    logger.LogError(ex, "Gemini generation failed for title '{Title}'", titleForLogging);
                    throw;
                }
                
                await Task.Delay(TimeSpan.FromSeconds((i + 1) * 2), cancellationToken);
            }
        }
        
        throw new InvalidOperationException("Gemini generation failed after retries.");
    }

    public async Task<string> GenerateEventDescriptionAsync(
        string title,
        string category,
        string city,
        string venue,
        CancellationToken cancellationToken = default)
    {
        var systemInstruction = """
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

        var requestData = new
        {
            systemInstruction = new { parts = new[] { new { text = systemInstruction } } },
            contents = new[]
            {
                new { role = "user", parts = new[] { new { text = userPrompt } } }
            },
            generationConfig = new { maxOutputTokens = 1000 }
        };

        return await GenerateContentAsync(requestData, title, cancellationToken);
    }

    
    // Internal classes for JSON deserialization
    private class GeminiResponse
    {
        public GeminiCandidate[]? Candidates { get; set; }
    }

    private class GeminiCandidate
    {
        public GeminiContent? Content { get; set; }
    }

    private class GeminiContent
    {
        public GeminiPart[]? Parts { get; set; }
    }

    private class GeminiPart
    {
        public string? Text { get; set; }
    }
}
