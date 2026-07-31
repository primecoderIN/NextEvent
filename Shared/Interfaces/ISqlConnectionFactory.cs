using System.Data;

namespace NextEvent.Shared.Interfaces;

/// <summary>
/// Factory interface to provide raw IDbConnection instances for Dapper queries.
/// This abstracts the database provider (e.g., SQLite, SQL Server) from the Application layer,
/// allowing the Application layer to execute fast queries without depending on Persistence details.
/// </summary>
public interface ISqlConnectionFactory
{
    IDbConnection CreateConnection();
}
