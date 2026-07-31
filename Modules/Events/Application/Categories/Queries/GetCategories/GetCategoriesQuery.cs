using NextEvent.Modules.Events.Application.Categories.DTOs;
using MediatR;

namespace NextEvent.Modules.Events.Application.Categories.Queries.GetCategories;
public class GetCategoriesQuery : IRequest<IEnumerable<CategoryDto>>
{
}
