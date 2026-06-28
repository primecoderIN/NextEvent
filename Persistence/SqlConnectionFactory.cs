using System.Data;
using Application.Core.Interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace Persistence;

/// <summary>
/// Implementation of ISqlConnectionFactory for SQL Server.
/// Belongs to the Persistence layer, so it has access to Microsoft.Data.SqlClient.
/// </summary>
public class SqlConnectionFactory(IConfiguration configuration) : ISqlConnectionFactory
{
    public IDbConnection CreateConnection()
    {
        // Retrieves the connection string from configuration and opens a new SQL Server connection.
        // Dapper will use this raw connection to execute highly optimized SQL queries.
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        var connection = new SqlConnection(connectionString);
        connection.Open();
        return connection;
    }
}
