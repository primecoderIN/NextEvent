using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NextEvent.Shared.Interfaces;
using System.Data;

namespace NextEvent.Shared.Persistence;

/// <summary>
/// Factory for creating open SQL Server connections for high-performance Dapper read queries.
/// Inject <see cref="ISqlConnectionFactory"/> in CQRS Query Handlers.
/// </summary>
public class SqlConnectionFactory(IConfiguration configuration) : ISqlConnectionFactory
{
    /// <summary>
    /// Creates and returns a new IDbConnection using the DefaultConnection string.
    /// </summary>
    public IDbConnection CreateConnection()
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

        return new SqlConnection(connectionString);
    }
}
