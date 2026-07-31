using NextEvent.Modules.Events.Persistence.Contexts;
using NextEvent.Modules.Events.Application.Categories.DTOs;
using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Identity.Domain;
using MediatR;

namespace NextEvent.Modules.Events.Application.Categories.Commands.SuggestCategory;
/// <summary>
/// Writes a new CategorySuggestion row (Status = Pending) instead of creating an inactive Category.
/// The slug is auto-generated from the name if not supplied.
/// </summary>
public class SuggestCategoryCommandHandler(
    EventsDbContext context,
    ICurrentUserService currentUserService)
    : IRequestHandler<SuggestCategoryCommand, CategoryDto>
{
    public async Task<CategoryDto> Handle(SuggestCategoryCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetCurrentUserId()
            ?? throw new UnauthorizedAccessException("User must be authenticated to suggest a category.");

        var slug = string.IsNullOrWhiteSpace(request.Slug)
            ? request.Name.Trim().ToLower().Replace(' ', '-')
            : request.Slug.Trim().ToLower();

        var suggestion = new CategorySuggestion
        {
            Name        = request.Name,
            Slug        = slug,
            Description = request.Description,
            SuggestedById = userId,
            Status      = CategorySuggestionStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow,
        };

        context.CategorySuggestions.Add(suggestion);
        await context.SaveChangesAsync(cancellationToken);

        // Return a lightweight CategoryDto as the API contract hasn't changed
        return new CategoryDto { Id = suggestion.Id, Name = suggestion.Name, Slug = suggestion.Slug };
    }
}
