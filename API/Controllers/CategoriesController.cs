using Application.Categories.Queries.GetCategories;
using Application.Categories.DTOs;
using Application.Categories.Commands.CreateCategory;
using Application.Categories.Commands.SuggestCategory;
using Application.Categories.Commands.ApproveCategory;
using API.Common;
using Domain.Constants;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers;

[Route(ApiRouteConstants.Categories.Base)]
public class CategoriesController : BaseApiController
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<CategoryDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<CategoryDto>>>> GetCategories(CancellationToken cancellationToken)
    {
        var categories = await Mediator.Send(new GetCategoriesQuery(), cancellationToken);
        return OkResponse(categories, "Categories retrieved successfully");
    }

    [HttpPost]
    [Authorize(Roles = RoleConstants.Admin)]
    [ProducesResponseType(typeof(ApiResponse<CategoryDto>), StatusCodes.Status201Created)]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory([FromBody] CreateCategoryDto dto, CancellationToken cancellationToken)
    {
        var created = await Mediator.Send(new CreateCategoryCommand { Name = dto.Name, Slug = dto.Slug, Description = dto.Description }, cancellationToken);
        return CreatedResponse(nameof(GetCategories), new { id = created.Id }, created, "Category created successfully");
    }

    [HttpPost(ApiRouteConstants.Categories.Suggest)]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<CategoryDto>), StatusCodes.Status201Created)]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> SuggestCategory([FromBody] CreateCategoryDto dto, CancellationToken cancellationToken)
    {
        var created = await Mediator.Send(new SuggestCategoryCommand { Name = dto.Name, Slug = dto.Slug, Description = dto.Description }, cancellationToken);
        return CreatedResponse(nameof(GetCategories), new { id = created.Id }, created, "Category suggestion submitted and pending approval");
    }

    [HttpPost(ApiRouteConstants.Categories.Approve)]
    [Authorize(Roles = RoleConstants.Admin)]
    [ProducesResponseType(typeof(ApiResponse<CategoryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> ApproveCategory([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var updated = await Mediator.Send(new ApproveCategoryCommand { Id = id }, cancellationToken);
        return OkResponse(updated, "Category approved");
    }
}
