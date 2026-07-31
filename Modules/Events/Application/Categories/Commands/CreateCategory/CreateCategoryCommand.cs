using NextEvent.Modules.Events.Application.Categories.DTOs;
using MediatR;

namespace NextEvent.Modules.Events.Application.Categories.Commands.CreateCategory;
public class CreateCategoryCommand : IRequest<CategoryDto>
{
    public required string Name { get; init; }
    public required string Slug { get; init; }
    public string? Description { get; init; }
}
