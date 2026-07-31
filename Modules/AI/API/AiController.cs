using NextEvent.Shared.Constants;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using NextEvent.Modules.AI.Application.Interfaces;
using NextEvent.Shared.Controllers;
using NextEvent.Shared.Common;

namespace NextEvent.Modules.AI.API;
[Route(ApiRouteConstants.Ai.Base)]
[Authorize]
public class AiController(IGeminiService geminiService) : BaseApiController
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


    // -----------------------------------------------------------------------
    // Endpoints
    // -----------------------------------------------------------------------

    /// <summary>
    /// Uses Gemini Pro to generate a compelling event description from the provided title, category, city, and venue.
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

        var description = await geminiService.GenerateEventDescriptionAsync(
            request.Title,
            request.Category,
            request.City,
            request.Venue,
            cancellationToken);

        return OkResponse(description, "Description generated successfully");
    }

}
