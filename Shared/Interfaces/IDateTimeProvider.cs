namespace NextEvent.Shared.Interfaces;

/// <summary>
/// Abstraction for the system clock to enable deterministic time testing.
/// </summary>
public interface IDateTimeProvider
{
    /// <summary>
    /// Gets the current date and time in UTC.
    /// </summary>
    DateTime UtcNow { get; }
}
