namespace NextEvent.Modules.Events.Application.Categories.DTOs;
public class CreateCategoryDto
{
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public string? Description { get; set; }
}
