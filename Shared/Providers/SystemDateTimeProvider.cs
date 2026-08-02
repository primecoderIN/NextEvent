using NextEvent.Shared.Interfaces;

namespace NextEvent.Shared.Providers;

/// <summary>
/// Default production implementation of the system clock.
/// </summary>
public class SystemDateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
