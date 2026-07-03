using Application.Categories.DTOs;
using Application.Core.Interfaces;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace Application.Categories.Commands.SuggestCategory;

public class SuggestCategoryCommandHandler(IAppDBContext context) : IRequestHandler<SuggestCategoryCommand, CategoryDto>
{
    public async Task<CategoryDto> Handle(SuggestCategoryCommand request, CancellationToken cancellationToken)
    {
        // If slug not provided, generate from name
        var slug = string.IsNullOrWhiteSpace(request.Slug)
            ? request.Name.Trim().ToLower().Replace(' ', '-')
            : request.Slug.Trim().ToLower();

        var exists = await context.Categories.AnyAsync(c => c.Slug == slug, cancellationToken);
        if (exists)
            throw new Exception("A category with the specified slug already exists.");

        var cat = new Category
        {
            Name = request.Name,
            Slug = slug,
            Description = request.Description,
            IsActive = false, // mark as pending until admin approves
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow,
        };

        context.Categories.Add(cat);
        await context.SaveChangesAsync(cancellationToken);

        return new CategoryDto { Id = cat.Id, Name = cat.Name, Slug = cat.Slug };
    }
}
