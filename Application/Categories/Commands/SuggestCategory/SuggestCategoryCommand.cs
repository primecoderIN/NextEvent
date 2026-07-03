using Application.Categories.DTOs;

namespace Application.Categories.Commands.SuggestCategory;

public class SuggestCategoryCommand : IRequest<CategoryDto>
{
    public required string Name { get; init; }
    public string? Slug { get; init; }
    public string? Description { get; init; }
}
