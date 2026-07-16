namespace Application.Organizations.DTOs;

/// <summary>
/// Read model returned by GET /api/organizations/{slug}.
/// Contains only public-safe fields — no internal audit data, no owner IDs,
/// no soft-delete timestamps.
/// </summary>
public class OrganizationPublicProfileDto
{
    // -----------------------------------------------------------------------
    // Organization identity & branding
    // -----------------------------------------------------------------------

    /// <summary>Organization primary key (GUID).</summary>
    public Guid    Id           { get; set; }

    /// <summary>
    /// URL-friendly unique identifier (e.g. "acme-events").
    /// Included so the client can build canonical URLs without the GUID.
    /// </summary>
    public string  Slug         { get; set; } = string.Empty;

    /// <summary>Display name of the organization.</summary>
    public string  Name         { get; set; } = string.Empty;

    /// <summary>Optional long-form description for the profile page.</summary>
    public string? Description  { get; set; }

    /// <summary>
    /// URL of the organization logo image.
    /// Safe to expose — it is already a public asset URL.
    /// </summary>
    public string? LogoUrl      { get; set; }

    /// <summary>
    /// URL of the cover/banner image.
    /// Safe to expose — it is already a public asset URL.
    /// </summary>
    public string? CoverImageUrl { get; set; }

    // -----------------------------------------------------------------------
    // Public contact & web presence
    // -----------------------------------------------------------------------

    /// <summary>Public website URL (optional).</summary>
    public string? WebsiteUrl   { get; set; }

    /// <summary>
    /// Public contact e-mail address.
    /// Exposed here because the org owner chose to provide it for public visibility.
    /// </summary>
    public string? ContactEmail { get; set; }

    /// <summary>
    /// Public contact phone number.
    /// Exposed here because the org owner chose to provide it for public visibility.
    /// </summary>
    public string? ContactPhone { get; set; }

    // -----------------------------------------------------------------------
    // Owner display (no internal user ID — only the display name)
    // -----------------------------------------------------------------------

    /// <summary>
    /// Display name of the organization owner.
    /// The OwnerUserId is intentionally excluded; only the human-readable
    /// name is surfaced so anonymous consumers cannot enumerate user IDs.
    /// </summary>
    public string? OwnerDisplayName { get; set; }

    /// <summary>
    /// UTC timestamp when the organization was created.
    /// Useful for "member since" display.
    /// </summary>
    public DateTimeOffset CreatedAtUtc { get; set; }

    // -----------------------------------------------------------------------
    // Upcoming public events
    // -----------------------------------------------------------------------

    /// <summary>
    /// Upcoming (future, non-cancelled) events for this organization,
    /// ordered by date ascending. Capped at 20 results.
    /// </summary>
    public List<PublicEventSummaryDto> UpcomingEvents { get; set; } = [];
}
