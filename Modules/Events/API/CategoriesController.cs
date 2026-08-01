using NextEvent.Modules.Events.Application.Categories.Queries.GetCategories;
using NextEvent.Modules.Events.Application.Categories.Queries.GetCategorySuggestions;
using NextEvent.Modules.Events.Application.Categories.DTOs;
using NextEvent.Modules.Events.Application.Categories.Commands.CreateCategory;
using NextEvent.Modules.Events.Application.Categories.Commands.SuggestCategory;
using NextEvent.Modules.Events.Application.Categories.Commands.ApproveCategory;
using NextEvent.Modules.Events.Application.Categories.Commands.RejectCategory;
using NextEvent.Shared.Constants;
using NextEvent.Modules.Identity.Domain;
using NextEvent.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace NextEvent.Modules.Events.API;
[Route(ApiRouteConstants.Categories.Base)]
public class CategoriesController : BaseApiController
{
    /// <summary>
    /// Retrieves all active event taxonomy categories.
    /// Public endpoint available to all users without authentication.
    /// </summary>
    /// <response code="200">Active categories retrieved successfully.</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<CategoryDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<CategoryDto>>>> GetCategories(CancellationToken cancellationToken)
    {
        var categories = await Mediator.Send(new GetCategoriesQuery(), cancellationToken);
        return OkResponse(categories, "Categories retrieved successfully");
    }

    /// <summary>
    /// Creates a new official event category directly.
    /// Restricted to platform Admins only.
    /// </summary>
    /// <param name="dto">Category payload containing name, unique slug, and optional description.</param>
    /// <param name="cancellationToken">Propagates cancellation notification.</param>
    /// <response code="201">Category created successfully.</response>
    /// <response code="400">Validation failure (e.g. invalid slug or duplicate name).</response>
    /// <response code="401">No valid JWT supplied.</response>
    /// <response code="403">Caller does not hold the Admin platform role.</response>
    [HttpPost]
    [Authorize(Roles = RoleConstants.Admin)]
    [ProducesResponseType(typeof(ApiResponse<CategoryDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory(
        [FromBody] CreateCategoryDto dto,
        CancellationToken cancellationToken)
    {
        var created = await Mediator.Send(
            new CreateCategoryCommand { Name = dto.Name, Slug = dto.Slug, Description = dto.Description },
            cancellationToken);

        return CreatedResponse(nameof(GetCategories), new { id = created.Id }, created, "Category created successfully");
    }

    /// <summary>
    /// Retrieves user-submitted category suggestions.
    /// Can be filtered by status (Pending, Approved, Rejected).
    /// Restricted to platform Admins only.
    /// </summary>
    /// <param name="queryDto">Query parameter DTO containing optional status filter ("Pending", "Approved", "Rejected").</param>
    /// <param name="cancellationToken">Propagates cancellation notification.</param>
    /// <response code="200">Category suggestions retrieved successfully.</response>
    /// <response code="401">No valid JWT supplied.</response>
    /// <response code="403">Caller does not hold the Admin platform role.</response>
    [HttpGet(ApiRouteConstants.Categories.Suggestions)]
    [Authorize(Roles = RoleConstants.Admin)]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<CategorySuggestionDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<IEnumerable<CategorySuggestionDto>>>> GetSuggestions(
        [FromQuery] GetCategorySuggestionsQueryDto queryDto,
        CancellationToken cancellationToken)
    {
        CategorySuggestionStatus? statusFilter = null;

        if (!string.IsNullOrWhiteSpace(queryDto.Status) &&
            Enum.TryParse<CategorySuggestionStatus>(queryDto.Status, ignoreCase: true, out var parsed))
        {
            statusFilter = parsed;
        }

        var suggestions = await Mediator.Send(
            new GetCategorySuggestionsQuery { Status = statusFilter },
            cancellationToken);

        return OkResponse(suggestions, "Category suggestions retrieved successfully");
    }

    /// <summary>
    /// Submits a category suggestion for platform Admin review.
    /// Any authenticated user can suggest new event categories.
    /// </summary>
    /// <param name="dto">Suggested category payload containing name, unique slug, and description.</param>
    /// <param name="cancellationToken">Propagates cancellation notification.</param>
    /// <response code="201">Category suggestion submitted and pending approval.</response>
    /// <response code="400">Validation failure.</response>
    /// <response code="401">No valid JWT supplied.</response>
    [HttpPost(ApiRouteConstants.Categories.Suggest)]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<CategoryDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> SuggestCategory(
        [FromBody] CreateCategoryDto dto,
        CancellationToken cancellationToken)
    {
        var created = await Mediator.Send(
            new SuggestCategoryCommand { Name = dto.Name, Slug = dto.Slug, Description = dto.Description },
            cancellationToken);

        return CreatedResponse(nameof(GetCategories), new { id = created.Id }, created,
            "Category suggestion submitted and pending approval");
    }

    /// <summary>
    /// Approves a pending category suggestion, publishing it into official categories.
    /// Restricted to platform Admins only.
    /// </summary>
    /// <param name="id">Unique identifier of the category suggestion.</param>
    /// <param name="cancellationToken">Propagates cancellation notification.</param>
    /// <response code="200">Category suggestion approved and published.</response>
    /// <response code="401">No valid JWT supplied.</response>
    /// <response code="403">Caller does not hold the Admin platform role.</response>
    /// <response code="404">Category suggestion with the specified ID was not found.</response>
    [HttpPost(ApiRouteConstants.Categories.Approve)]
    [Authorize(Roles = RoleConstants.Admin)]
    [ProducesResponseType(typeof(ApiResponse<CategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> ApproveCategory(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var category = await Mediator.Send(new ApproveCategoryCommand { Id = id }, cancellationToken);
        return OkResponse(category, "Category suggestion approved and published");
    }

    /// <summary>
    /// Rejects a pending category suggestion with an optional rejection reason.
    /// Restricted to platform Admins only.
    /// </summary>
    /// <param name="id">Unique identifier of the category suggestion.</param>
    /// <param name="dto">Payload containing the reason for rejection.</param>
    /// <param name="cancellationToken">Propagates cancellation notification.</param>
    /// <response code="200">Category suggestion rejected.</response>
    /// <response code="401">No valid JWT supplied.</response>
    /// <response code="403">Caller does not hold the Admin platform role.</response>
    /// <response code="404">Category suggestion with the specified ID was not found.</response>
    [HttpPost(ApiRouteConstants.Categories.Reject)]
    [Authorize(Roles = RoleConstants.Admin)]
    [ProducesResponseType(typeof(ApiResponse<CategorySuggestionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CategorySuggestionDto>>> RejectCategory(
        [FromRoute] Guid id,
        [FromBody] RejectCategoryDto dto,
        CancellationToken cancellationToken)
    {
        var suggestion = await Mediator.Send(
            new RejectCategoryCommand { Id = id, RejectionReason = dto.Reason },
            cancellationToken);

        return OkResponse(suggestion, "Category suggestion rejected");
    }
}
