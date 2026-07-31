using NextEvent.Modules.Events.Application.Categories.DTOs;
using NextEvent.Modules.Identity.Domain;
using MediatR;

namespace NextEvent.Modules.Events.Application.Categories.Queries.GetCategorySuggestions;
public class GetCategorySuggestionsQuery : IRequest<IEnumerable<CategorySuggestionDto>>
{
    /// <summary>
    /// Optional filter. When null, returns only Pending suggestions.
    /// Pass a specific status to see Approved or Rejected.
    /// </summary>
    public CategorySuggestionStatus? Status { get; init; }
}
