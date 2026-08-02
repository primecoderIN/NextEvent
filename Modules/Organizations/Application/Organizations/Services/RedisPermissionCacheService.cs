using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using NextEvent.Shared.Interfaces;
using StackExchange.Redis;

namespace NextEvent.Modules.Organizations.Application.Organizations.Services;

/// <summary>
/// Redis-backed implementation of <see cref="IPermissionCacheService"/>.
///
/// Cache key design
/// ────────────────
/// Permission entry : "perm:{userId}:{organizationId}"
///   Value           : JSON array of permission code strings, e.g. ["events.create","events.update"]
///   TTL             : <see cref="CacheTtl"/> (default 5 minutes)
///
/// Org member-key tracking set: "perm:org:{organizationId}:keys"
///   Value           : Redis Set of all "perm:{userId}:{orgId}" keys currently cached for that org.
///   Purpose         : Enables O(n-members) bulk eviction when a role changes, without scanning all
///                     Redis keys (KEYS command is O(N) on the entire keyspace — avoid in production).
///   TTL             : Slightly longer than CacheTtl so the set outlives its entries.
///
/// Dependency on IDistributedCache vs IConnectionMultiplexer
/// ──────────────────────────────────────────────────────────
/// <see cref="IDistributedCache"/> handles GET / SET / REMOVE for individual entries.
/// <see cref="IConnectionMultiplexer"/> is used for the tracking Set operations (SADD / SMEMBERS / DEL)
/// because IDistributedCache does not expose Redis Set primitives.
/// </summary>
public sealed class RedisPermissionCacheService(
    IDistributedCache cache,
    IConnectionMultiplexer redis,
    ILogger<RedisPermissionCacheService> logger)
    : IPermissionCacheService
{
    // ── Cache TTL ────────────────────────────────────────────────────────────
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(5);
    // Tracking set lives a little longer so eviction can still find entries
    // even if they were added just before the TTL boundary.
    private static readonly TimeSpan TrackingSetTtl = CacheTtl + TimeSpan.FromMinutes(1);

    private static readonly JsonSerializerOptions JsonOpts = new() { WriteIndented = false };

    // ── Key helpers ──────────────────────────────────────────────────────────

    /// <summary>Permission entry key for a single user in one org.</summary>
    private static string PermKey(string userId, Guid orgId) =>
        $"perm:{userId}:{orgId}";

    /// <summary>Redis Set key that tracks all perm keys belonging to an org.</summary>
    private static string OrgTrackingKey(Guid orgId) =>
        $"perm:org:{orgId}:keys";

    // ── IPermissionCacheService implementation ───────────────────────────────

    /// <inheritdoc />
    public async Task<IReadOnlySet<string>?> GetPermissionsAsync(
        string userId,
        Guid organizationId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var json = await cache.GetStringAsync(PermKey(userId, organizationId), cancellationToken);
            if (json is null)
                return null;

            var codes = JsonSerializer.Deserialize<List<string>>(json, JsonOpts);
            return codes is null ? null : new HashSet<string>(codes, StringComparer.OrdinalIgnoreCase);
        }
        catch (Exception ex)
        {
            // Cache read failures must NEVER break the request — log and return miss.
            logger.LogWarning(ex, "Redis GET failed for perm key {UserId}/{OrgId}. Falling back to DB.", userId, organizationId);
            return null;
        }
    }

    /// <inheritdoc />
    public async Task SetPermissionsAsync(
        string userId,
        Guid organizationId,
        IEnumerable<string> permissionCodes,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var key = PermKey(userId, organizationId);
            var json = JsonSerializer.Serialize(permissionCodes.ToList(), JsonOpts);

            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = CacheTtl
            };

            await cache.SetStringAsync(key, json, options, cancellationToken);

            // Register this key in the org's tracking Set so InvalidateOrganizationAsync can evict it.
            var db = redis.GetDatabase();
            await db.SetAddAsync(OrgTrackingKey(organizationId), key);
            await db.KeyExpireAsync(OrgTrackingKey(organizationId), TrackingSetTtl);
        }
        catch (Exception ex)
        {
            // Cache write failures are non-fatal — the next request will re-populate.
            logger.LogWarning(ex, "Redis SET failed for perm key {UserId}/{OrgId}. Continuing without cache.", userId, organizationId);
        }
    }

    /// <inheritdoc />
    public async Task InvalidateOrganizationAsync(
        Guid organizationId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var db = redis.GetDatabase();
            var trackingKey = OrgTrackingKey(organizationId);

            // Retrieve all cached perm keys for this org.
            var members = await db.SetMembersAsync(trackingKey);
            if (members.Length == 0)
            {
                logger.LogDebug("Permission cache invalidation: no cached entries found for org {OrgId}.", organizationId);
                return;
            }

            // Batch-delete all permission entries + the tracking set itself.
            var keysToDelete = members
                .Select(m => (RedisKey)m.ToString())
                .Append((RedisKey)trackingKey)
                .ToArray();

            var deleted = await db.KeyDeleteAsync(keysToDelete);
            logger.LogInformation(
                "Permission cache invalidated {Count} entries for org {OrgId}.",
                deleted, organizationId);
        }
        catch (Exception ex)
        {
            // Invalidation failure is non-fatal — TTL expiry will eventually evict stale entries.
            logger.LogWarning(ex, "Redis invalidation failed for org {OrgId}. Stale entries will expire via TTL.", organizationId);
        }
    }
}
