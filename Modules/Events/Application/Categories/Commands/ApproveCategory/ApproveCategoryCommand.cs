using NextEvent.Modules.Events.Application.Categories.DTOs;
using MediatR;

namespace NextEvent.Modules.Events.Application.Categories.Commands.ApproveCategory;
public class ApproveCategoryCommand : IRequest<CategoryDto>
{
    public required Guid Id { get; init; }
}
