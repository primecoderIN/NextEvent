namespace Application.Categories.DTOs;

/// <summary>
/// Represents a category suggestion returned to the admin dashboard.
/// Includes the suggester's display name resolved via the navigation property.
/// </summary>
public class CategorySuggestionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }

    /// <summary>Display name of the user who submitted the suggestion.</summary>
    public string SuggestedByDisplayName { get; set; } = string.Empty;

    public DateTimeOffset CreatedAtUtc { get; set; }

    /// <summary>"Pending", "Approved", or "Rejected"</summary>
    public string Status { get; set; } = "Pending";
}
