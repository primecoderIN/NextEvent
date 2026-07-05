using API.Common;
using API.Services;
using Domain.Constants;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route(ApiRouteConstants.Ai.Base)]
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
    /// Uses GPT-4o-mini to generate a compelling event description from the provided title, category, city, and venue.
    /// </summary>
    /// <response code="200">Description generated successfully.</response>
    /// <response code="400">Title is missing or invalid.</response>
    [HttpPost(ApiRouteConstants.Ai.GenerateDescription)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
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
    /// Uses GPT-4o-mini to classify the event title into one of the known categories. Returns an empty string if no confident match is found.
    /// </summary>
    /// <response code="200">Category suggested successfully.</response>
    /// <response code="400">Title is missing or invalid.</response>
    [HttpPost(ApiRouteConstants.Ai.SuggestCategory)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
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
