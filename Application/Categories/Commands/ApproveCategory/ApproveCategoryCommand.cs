using Application.Categories.DTOs;
using MediatR;

namespace Application.Categories.Commands.ApproveCategory;

public class ApproveCategoryCommand : IRequest<CategoryDto>
{
    public required Guid Id { get; init; }
}
