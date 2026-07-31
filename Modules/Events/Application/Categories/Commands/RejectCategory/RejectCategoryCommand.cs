using NextEvent.Modules.Events.Application.Categories.DTOs;
using MediatR;

namespace NextEvent.Modules.Events.Application.Categories.Commands.RejectCategory;
public class RejectCategoryCommand : IRequest<CategorySuggestionDto>
{
    public required Guid Id { get; init; }
    public string? RejectionReason { get; init; }
}
