using Application.Categories.DTOs;
using Application.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Categories.Commands.ApproveCategory;

public class ApproveCategoryCommandHandler(IAppDBContext context) : IRequestHandler<ApproveCategoryCommand, CategoryDto>
{
    public async Task<CategoryDto> Handle(ApproveCategoryCommand request, CancellationToken cancellationToken)
    {
        var cat = await context.Categories.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (cat is null)
            throw new KeyNotFoundException("Category not found");

        if (cat.IsActive)
            return new CategoryDto { Id = cat.Id, Name = cat.Name, Slug = cat.Slug };

        cat.IsActive = true;
        cat.UpdatedAtUtc = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return new CategoryDto { Id = cat.Id, Name = cat.Name, Slug = cat.Slug };
    }
}
