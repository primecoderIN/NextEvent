using NextEvent.Modules.Events.Persistence.Contexts;
using NextEvent.Modules.Events.Application.Categories.DTOs;
using NextEvent.Shared.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace NextEvent.Modules.Events.Application.Categories.Queries.GetCategories;
public class GetCategoriesQueryHandler(EventsDbContext context) : IRequestHandler<GetCategoriesQuery, IEnumerable<CategoryDto>>
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
