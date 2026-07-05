using Application.Categories.DTOs;
using Domain;
using MediatR;

namespace Application.Categories.Queries.GetCategorySuggestions;

public class GetCategorySuggestionsQuery : IRequest<IEnumerable<CategorySuggestionDto>>
{
    /// <summary>
    /// Optional filter. When null, returns only Pending suggestions.
    /// Pass a specific status to see Approved or Rejected.
    /// </summary>
    public CategorySuggestionStatus? Status { get; init; }
}
