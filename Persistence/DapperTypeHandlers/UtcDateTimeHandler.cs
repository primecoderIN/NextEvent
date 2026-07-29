using System.Data;
using Dapper;

namespace Persistence.DapperTypeHandlers;

/// <summary>
/// Forces Dapper to parse all DateTime values retrieved from the database as DateTimeKind.Utc.
/// This ensures System.Text.Json correctly serializes them with the 'Z' (UTC) offset.
/// </summary>
public class UtcDateTimeHandler : SqlMapper.TypeHandler<DateTime>
{
    public override void SetValue(IDbDataParameter parameter, DateTime value)
    {
        parameter.Value = value;
    }

    public override DateTime Parse(object value)
    {
        // SQL Server datetime2 comes back as a DateTime.
        // We explicitly tell .NET that this is UTC.
        return DateTime.SpecifyKind((DateTime)value, DateTimeKind.Utc);
    }
}

public class NullableUtcDateTimeHandler : SqlMapper.TypeHandler<DateTime?>
{
    public override void SetValue(IDbDataParameter parameter, DateTime? value)
    {
        parameter.Value = value;
    }

    public override DateTime? Parse(object value)
    {
        if (value == null || value is DBNull) return null;
        return DateTime.SpecifyKind((DateTime)value, DateTimeKind.Utc);
    }
}
