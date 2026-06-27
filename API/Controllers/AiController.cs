using API.Common;
using API.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/ai")]
public class AiController(IOpenAiService openAiService) : BaseApiController
{
    // -----------------------------------------------------------------------
    // Request DTOs
    // -----------------------------------------------------------------------

    /// <summary>Input for the description generation endpoint.</summary>
    public record GenerateDescriptionRequest(
        string Title,
        string Category,
        string City,
        string Venue);

    /// <summary>Input for the category suggestion endpoint.</summary>
    public record SuggestCategoryRequest(string Title);

    // -----------------------------------------------------------------------
    // Endpoints
    // -----------------------------------------------------------------------

    /// <summary>
    /// POST /api/ai/generate-description
    /// Uses GPT-4o-mini to generate a compelling event description from
    /// the provided title, category, city, and venue.
    /// </summary>
    [HttpPost("generate-description")]
    public async Task<ActionResult<ApiResponse<string>>> GenerateDescription(
        [FromBody] GenerateDescriptionRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(ApiResponse.Fail("Title is required to generate a description."));

        var description = await openAiService.GenerateEventDescriptionAsync(
            request.Title,
            request.Category,
            request.City,
            request.Venue,
            cancellationToken);

        return OkResponse(description, "Description generated successfully");
    }

    /// <summary>
    /// POST /api/ai/suggest-category
    /// Uses GPT-4o-mini to classify the event title into one of the known categories.
    /// Returns an empty string if no confident match is found.
    /// </summary>
    [HttpPost("suggest-category")]
    public async Task<ActionResult<ApiResponse<string>>> SuggestCategory(
        [FromBody] SuggestCategoryRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(ApiResponse.Fail("Title is required to suggest a category."));

        var category = await openAiService.SuggestCategoryAsync(
            request.Title,
            cancellationToken);

        return OkResponse(category, "Category suggested successfully");
    }
}
