namespace NextEvent.Modules.Events.Domain;

/// <summary>
/// Represents a report filed by a user against a specific event.
/// </summary>
public class EventReport
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// The event being reported.
    /// </summary>
    public Guid EventId { get; set; }

    public Event? EventRef { get; set; }

    /// <summary>
    /// The ID of the user who filed the report.
    /// </summary>
    public required string ReportedById { get; set; }

    /// <summary>
    /// The reason for reporting the event.
    /// </summary>
    public required string Reason { get; set; }

    /// <summary>
    /// UTC timestamp of when the report was filed.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
