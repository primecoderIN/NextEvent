using NextEvent.Modules.Events.Persistence.Contexts;
using NextEvent.Modules.Events.Application.Categories.DTOs;
using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Identity.Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace NextEvent.Modules.Events.Application.Categories.Commands.CreateCategory;
public class CreateCategoryCommandHandler(
    EventsDbContext context,
    IDateTimeProvider dateTimeProvider) : IRequestHandler<CreateCategoryCommand, CategoryDto>
{
    public async Task<CategoryDto> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        // Ensure slug uniqueness
        var exists = await context.Categories.AnyAsync(c => c.Slug == request.Slug, cancellationToken);
        if (exists)
            throw new BusinessRuleException("A category with the specified slug already exists.");

        var now = dateTimeProvider.UtcNow;

        var cat = new Category
        {
            Name = request.Name,
            Slug = request.Slug,
            Description = request.Description,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        context.Categories.Add(cat);
        await context.SaveChangesAsync(cancellationToken);

        return new CategoryDto { Id = cat.Id, Name = cat.Name, Slug = cat.Slug };
    }
}
