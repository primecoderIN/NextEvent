namespace NextEvent.Modules.Events.Application.Events.DTOs;

public class EventReportDto
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public string ReportedById { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
