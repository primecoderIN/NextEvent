namespace Domain;

/// <summary>
/// Represents the Event entity in the Domain layer.
/// This entity contains the core business data and rich behavior (domain methods) 
/// used to manipulate the state of an event.
/// </summary>
public class Event
{
    /// <summary>
    /// Using Guid as the primary key offers better indexing performance in 
    /// relational databases compared to standard strings.
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string Title { get; set; }

    public required string Description { get; set; }

    public required string Category { get; set; }

    public DateTime Date { get; set; }
    public required string City { get; set; }
    public required string Venue { get; set; }

    public bool IsCancelled { get; set; }

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    // -----------------------------------------------------------------------
    // Domain update methods — each accepts a nullable value and only applies
    // the change when the caller actually provided something (non-null).
    // This enables PATCH-like updates: omitted fields stay untouched.
    // -----------------------------------------------------------------------

    public void ChangeTitle(string? value)
    {
        if (value is not null) Title = value;
    }

    public void ChangeDescription(string? value)
    {
        if (value is not null) Description = value;
    }

    public void ChangeCategory(string? value)
    {
        if (value is not null) Category = value;
    }

    public void ChangeDate(DateTime? value)
    {
        if (value.HasValue) Date = value.Value;
    }

    public void ChangeCity(string? value)
    {
        if (value is not null) City = value;
    }

    public void ChangeVenue(string? value)
    {
        if (value is not null) Venue = value;
    }

    public void ChangeIsCancelled(bool? value)
    {
        if (value.HasValue) IsCancelled = value.Value;
    }

    public void ChangeLatitude(double? value)
    {
        if (value.HasValue) Latitude = value.Value;
    }

    public void ChangeLongitude(double? value)
    {
        if (value.HasValue) Longitude = value.Value;
    }
}