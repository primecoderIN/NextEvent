namespace Application.Events.DTOs;

/// <summary>
/// Data sent by the client for a PATCH-like update.
/// Every field is nullable — only the fields the client provides are applied.
/// Omitted fields (null) leave the existing entity value untouched.
/// </summary>
public class UpdateEventDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public Guid? CategoryId { get; set; }
    public DateTime? Date { get; set; }
    public string? TimeZoneId { get; set; }
    public string? City { get; set; }
    public string? Venue { get; set; }
    public bool? IsCancelled { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}
