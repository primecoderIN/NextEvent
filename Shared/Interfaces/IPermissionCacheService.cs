namespace NextEvent.Shared.Interfaces;

/// <summary>
/// Abstraction for caching the resolved permission codes for a user within an organization.
///
/// Cache key shape: perm:{userId}:{organizationId}
/// Cache value    : JSON-serialized array of permission code strings
/// TTL            : Configurable (default 5 minutes)
///
/// Implementations:
///   - RedisPermissionCacheService  — production (backed by IDistributedCache → Redis)
///   - In-memory IDistributedCache  — integration/unit tests (no Redis required)
/// </summary>
public interface IPermissionCacheService
{
    /// <summary>
    /// Retrieves the cached set of permission codes the user holds in the given organization.
    /// Returns <c>null</c> on a cache miss.
    /// </summary>
    Task<IReadOnlySet<string>?> GetPermissionsAsync(
        string userId,
        Guid organizationId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Writes the resolved permission codes into the cache with the configured TTL.
    /// Also registers the cache key in the org's tracking set so it can be bulk-evicted.
    /// </summary>
    Task SetPermissionsAsync(
        string userId,
        Guid organizationId,
        IEnumerable<string> permissionCodes,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Evicts ALL cached permission entries for every member of the given organization.
    /// Call this after any role or permission assignment change to prevent stale reads.
    /// </summary>
    Task InvalidateOrganizationAsync(
        Guid organizationId,
        CancellationToken cancellationToken = default);
}
