using NextEvent.Shared.Pagination;

namespace NextEvent.Modules.Events.Application.Events.DTOs;

/// <summary>
/// Query parameter DTO for filtering and paginating events.
/// Encapsulates search query, category, city, date range, organization ID, and pagination bounds.
/// </summary>
public class GetEventsQueryDto : PaginationParams
{
    /// <summary>Free-text search query matching event title, description, city, or venue.</summary>
    public string? Q { get; set; }

    /// <summary>Optional category ID filter.</summary>
    public Guid? CategoryId { get; set; }

    /// <summary>Optional city filter.</summary>
    public string? City { get; set; }

    /// <summary>Optional start date filter (UTC).</summary>
    public DateTime? DateFrom { get; set; }

    /// <summary>Optional end date filter (UTC).</summary>
    public DateTime? DateTo { get; set; }

    /// <summary>Optional organization ID filter.</summary>
    public Guid? OrganizationId { get; set; }

    /// <summary>Optional status filter (e.g., "published", "unpublished", "reported").</summary>
    public string? Status { get; set; }
}
