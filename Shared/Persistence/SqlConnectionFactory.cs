using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NextEvent.Shared.Interfaces;
using System.Data;

namespace NextEvent.Shared.Persistence;

public class SqlConnectionFactory(IConfiguration configuration) : ISqlConnectionFactory
{
    public IDbConnection CreateConnection()
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

        return new SqlConnection(connectionString);
    }
}
