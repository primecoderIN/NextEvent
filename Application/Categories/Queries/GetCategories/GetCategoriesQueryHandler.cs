using Application.Categories.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Application.Categories.Queries.GetCategories;

public class GetCategoriesQueryHandler(IAppDBContext context) : IRequestHandler<GetCategoriesQuery, IEnumerable<CategoryDto>>
{
    public async Task<IEnumerable<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        return await context.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
            })
            .ToListAsync(cancellationToken);
    }
}
