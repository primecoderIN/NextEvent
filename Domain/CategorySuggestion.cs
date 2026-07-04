namespace Domain;

/// <summary>
/// Represents a community-submitted suggestion for a new category.
/// Lives in its own table so the Categories table stays clean (only approved taxonomy).
/// State machine: Pending → Approved | Rejected
/// </summary>
public class CategorySuggestion
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string Name { get; set; }

    public required string Slug { get; set; }

    public string? Description { get; set; }

    // ─── State ───────────────────────────────────────────────────────────────
    public CategorySuggestionStatus Status { get; set; } = CategorySuggestionStatus.Pending;

    // ─── Suggester (required) ─────────────────────────────────────────────────
    public required string SuggestedById { get; set; }

    /// <summary>Navigation property — loaded when needed via EF Include.</summary>
    public User? SuggestedBy { get; set; }

    // ─── Organization (optional — future feature) ─────────────────────────────
    public Guid? OrganizationId { get; set; }

    // ─── Review metadata (populated when Admin approves / rejects) ────────────
    public string? ReviewedById { get; set; }

    /// <summary>Navigation property for the reviewing admin.</summary>
    public User? ReviewedBy { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public string? RejectionReason { get; set; }

    // ─── On approval, link to the resulting Category ──────────────────────────
    public Guid? ApprovedCategoryId { get; set; }

    public Category? ApprovedCategory { get; set; }

    // ─── Timestamps ───────────────────────────────────────────────────────────
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
