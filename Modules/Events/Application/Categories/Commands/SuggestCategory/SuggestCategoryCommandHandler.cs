using NextEvent.Modules.Events.Persistence.Contexts;
using NextEvent.Modules.Events.Application.Categories.DTOs;
using NextEvent.Shared.Interfaces;
using NextEvent.Shared.Exceptions;
using NextEvent.Modules.Identity.Domain;
using MediatR;
using System.Text.RegularExpressions;

namespace NextEvent.Modules.Events.Application.Categories.Commands.SuggestCategory;
/// <summary>
/// Writes a new CategorySuggestion row (Status = Pending) instead of creating an inactive Category.
/// The slug is auto-generated from the name if not supplied.
/// </summary>
public class SuggestCategoryCommandHandler(
    EventsDbContext context,
    ICurrentUserService currentUserService,
    IDateTimeProvider dateTimeProvider)
    : IRequestHandler<SuggestCategoryCommand, CategoryDto>
{
    public async Task<CategoryDto> Handle(SuggestCategoryCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetCurrentUserId()
            ?? throw new UnauthorizedException("User must be authenticated to suggest a category.");

        var slug = string.IsNullOrWhiteSpace(request.Slug)
            ? GenerateSlug(request.Name)
            : NormalizeSlug(request.Slug);

        var now = dateTimeProvider.UtcNow;

        var suggestion = new CategorySuggestion
        {
            Name          = request.Name,
            Slug          = slug,
            Description   = request.Description,
            SuggestedById = userId,
            Status        = CategorySuggestionStatus.Pending,
            CreatedAtUtc  = now,
            UpdatedAtUtc  = now,
        };

        context.CategorySuggestions.Add(suggestion);
        await context.SaveChangesAsync(cancellationToken);

        // Return a lightweight CategoryDto as the API contract hasn't changed
        return new CategoryDto { Id = suggestion.Id, Name = suggestion.Name, Slug = suggestion.Slug };
    }

    /// <summary>
    /// Generates a URL-safe slug from a display name.
    /// Strips non-ASCII characters, removes special chars, collapses whitespace to hyphens.
    /// Example: "C# Events and More!" becomes "c-events-and-more".
    /// </summary>
    private static string GenerateSlug(string name)
    {
        // Lowercase and trim
        var slug = name.Trim().ToLowerInvariant();
        // Remove characters that are not letters, digits, spaces, or hyphens
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        // Collapse multiple whitespace/hyphens into a single hyphen
        slug = Regex.Replace(slug, @"[\s-]+", "-");
        // Trim leading/trailing hyphens
        return slug.Trim('-');
    }

    /// <summary>
    /// Normalises a caller-supplied slug: lowercase, strips invalid chars, collapses runs.
    /// </summary>
    private static string NormalizeSlug(string slug)
    {
        slug = slug.Trim().ToLowerInvariant();
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"[\s-]+", "-");
        return slug.Trim('-');
    }
}
