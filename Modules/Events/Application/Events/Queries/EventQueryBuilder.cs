using Dapper;

namespace NextEvent.Modules.Events.Application.Events.Queries;

/// <summary>
/// A SQL builder utility that encapsulates the massive duplication
/// found across the Event query handlers (Public, Admin, and Organizer).
/// Provides a fluent API to build the WHERE clauses and parameter list.
/// </summary>
public class EventQueryBuilder
{
    private readonly List<string> _whereClauses = new();
    private readonly DynamicParameters _parameters = new();

    public EventQueryBuilder(int pageNumber, int pageSize)
    {
        _parameters.Add("Offset", (pageNumber - 1) * pageSize);
        _parameters.Add("PageSize", pageSize);
    }

    public EventQueryBuilder WithSearch(string? q)
    {
        if (!string.IsNullOrWhiteSpace(q))
        {
            _whereClauses.Add("(e.Title LIKE @Q OR e.Description LIKE @Q)");
            _parameters.Add("Q", $"%{q}%");
        }
        return this;
    }

    public EventQueryBuilder WithCategory(Guid? categoryId)
    {
        if (categoryId.HasValue)
        {
            _whereClauses.Add("e.CategoryId = @CategoryId");
            _parameters.Add("CategoryId", categoryId.Value);
        }
        return this;
    }

    public EventQueryBuilder WithCity(string? city)
    {
        if (!string.IsNullOrWhiteSpace(city))
        {
            _whereClauses.Add("e.City LIKE @City");
            _parameters.Add("City", $"%{city}%");
        }
        return this;
    }

    public EventQueryBuilder WithDateRange(DateTime? from, DateTime? to)
    {
        if (from.HasValue)
        {
            _whereClauses.Add("e.Date >= @DateFrom");
            _parameters.Add("DateFrom", from.Value);
        }
        if (to.HasValue)
        {
            _whereClauses.Add("e.Date <= @DateTo");
            _parameters.Add("DateTo", to.Value);
        }
        return this;
    }

    public EventQueryBuilder WithOrganization(Guid? organizationId)
    {
        if (organizationId.HasValue)
        {
            _whereClauses.Add("e.OrganizationId = @OrganizationId");
            _parameters.Add("OrganizationId", organizationId.Value);
        }
        return this;
    }

    public EventQueryBuilder WithActiveOnly()
    {
        _whereClauses.Add("e.IsCancelled = 0 AND e.IsSuspended = 0");
        return this;
    }

    public EventQueryBuilder WithCustomCondition(string sqlCondition, string paramName, object paramValue)
    {
        _whereClauses.Add(sqlCondition);
        _parameters.Add(paramName, paramValue);
        return this;
    }

    public EventQueryBuilder WithFalseCondition()
    {
        _whereClauses.Add("1 = 0");
        return this;
    }

    /// <summary>
    /// Builds the final SQL query containing both the COUNT query and the paginated SELECT query.
    /// Default order is ascending (used by public API), use descending for admin/organizer panels.
    /// </summary>
    public (string Sql, DynamicParameters Parameters) Build(bool orderDescending = false)
    {
        var whereSql = _whereClauses.Count > 0 ? "WHERE " + string.Join(" AND ", _whereClauses) : "";
        var order = orderDescending ? "DESC" : "ASC";

        var sql = $@"
            SELECT COUNT(e.Id) FROM [evt].[Events] e {whereSql};

            SELECT e.Id,
                   e.Title,
                   e.Description,
                   e.CategoryId,
                   c.Name AS Category,
                   e.Date,
                   e.TimeZoneId,
                   e.City,
                   e.Venue,
                   e.IsCancelled,
                   e.IsSuspended,
                   e.Latitude,
                   e.Longitude,
                   o.Id AS OrganizationId,
                   o.Name AS OrganizationName,
                   o.Slug AS OrganizationSlug,
                   o.LogoUrl AS OrganizationLogoUrl
            FROM [evt].[Events] e
            LEFT JOIN [evt].[Categories] c ON e.CategoryId = c.Id
            LEFT JOIN [org].[Organizations] o ON e.OrganizationId = o.Id
            {whereSql}
            ORDER BY e.Date {order}
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;";

        return (sql, _parameters);
    }
}
