namespace Application.Organizations.DTOs;

/// <summary>
/// Lightweight summary of an upcoming public event, returned as part of
/// <see cref="OrganizationPublicProfileDto"/>.
/// Only fields safe for unauthenticated consumers are included.
/// </summary>
public class PublicEventSummaryDto
{
    /// <summary>Event primary key.</summary>
    public Guid   Id       { get; set; }

    /// <summary>Event title — the main searchable display text.</summary>
    public string Title    { get; set; } = string.Empty;

    /// <summary>Short description — enough for a card preview.</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Scheduled date/time of the event (UTC).
    /// Only future events are returned (Date >= NOW).
    /// </summary>
    public DateTime Date    { get; set; }
    public string TimeZoneId { get; set; } = string.Empty;

    /// <summary>City where the event takes place.</summary>
    public string City    { get; set; } = string.Empty;

    /// <summary>Venue name within the city.</summary>
    public string Venue   { get; set; } = string.Empty;

    /// <summary>Category name for display/filter purposes. Null if uncategorised.</summary>
    public string? CategoryName { get; set; }
}
