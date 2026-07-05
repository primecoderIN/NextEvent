using Application.Categories.Queries.GetCategories;
using Application.Categories.Queries.GetCategorySuggestions;
using Application.Categories.DTOs;
using Application.Categories.Commands.CreateCategory;
using Application.Categories.Commands.SuggestCategory;
using Application.Categories.Commands.ApproveCategory;
using Application.Categories.Commands.RejectCategory;
using API.Common;
using Domain;
using Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route(ApiRouteConstants.Categories.Base)]
public class CategoriesController : BaseApiController
{
    // ── GET api/categories ────────────────────────────────────────────────────
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<CategoryDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<CategoryDto>>>> GetCategories(CancellationToken cancellationToken)
    {
        var categories = await Mediator.Send(new GetCategoriesQuery(), cancellationToken);
        return OkResponse(categories, "Categories retrieved successfully");
    }

    // ── POST api/categories (Admin only) ─────────────────────────────────────
    [HttpPost]
    [Authorize(Roles = RoleConstants.Admin)]
    [ProducesResponseType(typeof(ApiResponse<CategoryDto>), StatusCodes.Status201Created)]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory(
        [FromBody] CreateCategoryDto dto,
        CancellationToken cancellationToken)
    {
        var created = await Mediator.Send(
            new CreateCategoryCommand { Name = dto.Name, Slug = dto.Slug, Description = dto.Description },
            cancellationToken);

        return CreatedResponse(nameof(GetCategories), new { id = created.Id }, created, "Category created successfully");
    }

    // ── GET api/categories/suggestions (Admin only) ───────────────────────────
    [HttpGet(ApiRouteConstants.Categories.Suggestions)]
    [Authorize(Roles = RoleConstants.Admin)]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<CategorySuggestionDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<CategorySuggestionDto>>>> GetSuggestions(
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        CategorySuggestionStatus? statusFilter = null;

        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<CategorySuggestionStatus>(status, ignoreCase: true, out var parsed))
        {
            statusFilter = parsed;
        }

        var suggestions = await Mediator.Send(
            new GetCategorySuggestionsQuery { Status = statusFilter },
            cancellationToken);

        return OkResponse(suggestions, "Category suggestions retrieved successfully");
    }

    // ── POST api/categories/suggest (Any authenticated user) ──────────────────
    [HttpPost(ApiRouteConstants.Categories.Suggest)]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<CategoryDto>), StatusCodes.Status201Created)]
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

    // ── POST api/categories/{id}/approve (Admin only) ─────────────────────────
    [HttpPost(ApiRouteConstants.Categories.Approve)]
    [Authorize(Roles = RoleConstants.Admin)]
    [ProducesResponseType(typeof(ApiResponse<CategoryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> ApproveCategory(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var category = await Mediator.Send(new ApproveCategoryCommand { Id = id }, cancellationToken);
        return OkResponse(category, "Category suggestion approved and published");
    }

    // ── POST api/categories/{id}/reject (Admin only) ──────────────────────────
    [HttpPost(ApiRouteConstants.Categories.Reject)]
    [Authorize(Roles = RoleConstants.Admin)]
    [ProducesResponseType(typeof(ApiResponse<CategorySuggestionDto>), StatusCodes.Status200OK)]
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
