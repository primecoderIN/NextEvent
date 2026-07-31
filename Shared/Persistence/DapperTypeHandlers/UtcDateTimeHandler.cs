using System;
using System.Data;
using Dapper;

namespace NextEvent.Shared.Persistence.DapperTypeHandlers;

public class UtcDateTimeHandler : SqlMapper.TypeHandler<DateTime>
{
    public override void SetValue(IDbDataParameter parameter, DateTime value)
    {
        parameter.Value = value;
    }

    public override DateTime Parse(object value)
    {
        return DateTime.SpecifyKind((DateTime)value, DateTimeKind.Utc);
    }
}

public class NullableUtcDateTimeHandler : SqlMapper.TypeHandler<DateTime?>
{
    public override void SetValue(IDbDataParameter parameter, DateTime? value)
    {
        parameter.Value = value.HasValue ? (object)value.Value : DBNull.Value;
    }

    public override DateTime? Parse(object value)
    {
        if (value == null || value is DBNull)
            return null;

        return DateTime.SpecifyKind((DateTime)value, DateTimeKind.Utc);
    }
}
