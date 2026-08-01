namespace NextEvent.Modules.Events.Application.Categories.DTOs;

/// <summary>
/// Query parameter DTO for filtering category suggestions.
/// </summary>
public class GetCategorySuggestionsQueryDto
{
    /// <summary>Optional status filter ("Pending", "Approved", "Rejected").</summary>
    public string? Status { get; set; }
}
