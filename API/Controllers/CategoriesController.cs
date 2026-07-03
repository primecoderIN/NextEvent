using Application.Categories.Queries.GetCategories;
using Application.Categories.DTOs;
using API.Common;

namespace API.Controllers;

[Route("api/categories")]
public class CategoriesController : BaseApiController
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<CategoryDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<CategoryDto>>>> GetCategories(CancellationToken cancellationToken)
    {
        var categories = await Mediator.Send(new GetCategoriesQuery(), cancellationToken);
        return OkResponse(categories, "Categories retrieved successfully");
    }
}
