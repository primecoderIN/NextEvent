using Application.Categories.DTOs;
using MediatR;

namespace Application.Categories.Queries.GetCategories;

public class GetCategoriesQuery : IRequest<IEnumerable<CategoryDto>>
{
}
