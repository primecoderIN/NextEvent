using Application.Categories.DTOs;
using Application.Core.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Categories.Queries.GetCategorySuggestions;

/// <summary>
/// Returns category suggestions for the admin dashboard.
/// By default returns only Pending suggestions; a Status filter can be added later.
/// Uses EF Include to load the SuggestedBy navigation property in a single query
/// (no N+1, no raw SQL, no UserManager dependency).
/// </summary>
public class GetCategorySuggestionsQueryHandler(IAppDBContext context)
    : IRequestHandler<GetCategorySuggestionsQuery, IEnumerable<CategorySuggestionDto>>
{
    public async Task<IEnumerable<CategorySuggestionDto>> Handle(
        GetCategorySuggestionsQuery request,
        CancellationToken cancellationToken)
    {
        var query = context.CategorySuggestions
            .Include(s => s.SuggestedBy)
            .AsQueryable();

        // Optional status filter — default is Pending only
        if (request.Status.HasValue)
            query = query.Where(s => s.Status == request.Status.Value);
        else
            query = query.Where(s => s.Status == CategorySuggestionStatus.Pending);

        var suggestions = await query
            .OrderByDescending(s => s.CreatedAtUtc)
            .Select(s => new CategorySuggestionDto
            {
                Id                     = s.Id,
                Name                   = s.Name,
                Slug                   = s.Slug,
                Description            = s.Description,
                SuggestedByDisplayName = s.SuggestedBy != null ? (s.SuggestedBy.DisplayName ?? "Unknown") : "Unknown",
                CreatedAtUtc           = s.CreatedAtUtc,
                Status                 = s.Status.ToString(),
            })
            .ToListAsync(cancellationToken);

        return suggestions;
    }
}
