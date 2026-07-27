using Application.Categories.DTOs;
using Application.Core.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Categories.Commands.CreateCategory;

public class CreateCategoryCommandHandler(IAppDBContext context) : IRequestHandler<CreateCategoryCommand, CategoryDto>
{
    public async Task<CategoryDto> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        // Ensure slug uniqueness
        var exists = await context.Categories.AnyAsync(c => c.Slug == request.Slug, cancellationToken);
        if (exists)
            throw new Exception("A category with the specified slug already exists.");

        var cat = new Category
        {
            Name = request.Name,
            Slug = request.Slug,
            Description = request.Description,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow,
        };

        context.Categories.Add(cat);
        await context.SaveChangesAsync(cancellationToken);

        return new CategoryDto { Id = cat.Id, Name = cat.Name, Slug = cat.Slug };
    }
}
