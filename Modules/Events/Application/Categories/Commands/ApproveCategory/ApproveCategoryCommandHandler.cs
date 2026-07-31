using NextEvent.Modules.Events.Persistence.Contexts;
using NextEvent.Modules.Events.Application.Categories.DTOs;
using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Identity.Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace NextEvent.Modules.Events.Application.Categories.Commands.ApproveCategory;
/// <summary>
/// Approves a pending CategorySuggestion:
/// 1. Creates a proper Category from the suggestion data.
/// 2. Marks the suggestion Status = Approved, sets ReviewedById / ReviewedAt / ApprovedCategoryId.
/// Idempotent — if already approved, returns the existing linked Category.
/// </summary>
public class ApproveCategoryCommandHandler(
    EventsDbContext context,
    ICurrentUserService currentUserService)
    : IRequestHandler<ApproveCategoryCommand, CategoryDto>
{
    public async Task<CategoryDto> Handle(ApproveCategoryCommand request, CancellationToken cancellationToken)
    {
        var reviewerId = currentUserService.GetCurrentUserId()
            ?? throw new UnauthorizedAccessException("Reviewer must be authenticated.");

        var suggestion = await context.CategorySuggestions
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (suggestion is null)
            throw new KeyNotFoundException($"Category suggestion {request.Id} not found.");

        // Idempotent — already approved, return the linked Category
        if (suggestion.Status == CategorySuggestionStatus.Approved && suggestion.ApprovedCategoryId.HasValue)
        {
            var existing = await context.Categories
                .FirstOrDefaultAsync(c => c.Id == suggestion.ApprovedCategoryId, cancellationToken);

            if (existing is not null)
                return new CategoryDto { Id = existing.Id, Name = existing.Name, Slug = existing.Slug };
        }

        // Check slug uniqueness in Categories table
        var slugExists = await context.Categories
            .AnyAsync(c => c.Slug == suggestion.Slug, cancellationToken);

        if (slugExists)
            throw new InvalidOperationException($"A category with slug '{suggestion.Slug}' already exists.");

        // Create the real Category
        var category = new Category
        {
            Name        = suggestion.Name,
            Slug        = suggestion.Slug,
            Description = suggestion.Description,
            IsActive    = true,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow,
        };

        context.Categories.Add(category);

        // Update suggestion metadata
        suggestion.Status             = CategorySuggestionStatus.Approved;
        suggestion.ReviewedById       = reviewerId;
        suggestion.ReviewedAt         = DateTime.UtcNow;
        suggestion.ApprovedCategoryId = category.Id;
        suggestion.UpdatedAtUtc       = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return new CategoryDto { Id = category.Id, Name = category.Name, Slug = category.Slug };
    }
}
