using Application.Categories.DTOs;

namespace Application.Categories.Commands.RejectCategory;

public class RejectCategoryCommand : IRequest<CategorySuggestionDto>
{
    public required Guid Id { get; init; }
    public string? RejectionReason { get; init; }
}
