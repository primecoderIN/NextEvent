// using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
// using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
// using Application.Core.Interfaces;

namespace Persistence;

// Implementing IAppDBContext allows the Application layer to use the DB 
// without directly referencing Entity Framework or the Persistence project.
public class AppDBContext(DbContextOptions options) : IdentityDbContext<User>(options), IAppDBContext //Whatever options we passed from program.cs has to be passed to DbContext
{
    public DbSet<Event> Events { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Value converter: store DateTime as UTC ISO-8601 text in SQLite,
        // and always read it back as DateTimeKind.Utc so the JSON serializer
        // emits the trailing "Z" (Zulu) suffix.
        var utcConverter = new ValueConverter<DateTime, string>(
            // Write: convert to UTC then store as round-trip format string
            v => v.ToUniversalTime().ToString("O"),
            // Read: parse the stored string and force Kind = Utc
            v => DateTime.SpecifyKind(DateTime.Parse(v), DateTimeKind.Utc)
        );

        var nullableUtcConverter = new ValueConverter<DateTime?, string?>(
            v => v.HasValue ? v.Value.ToUniversalTime().ToString("O") : null,
            v => v != null ? DateTime.SpecifyKind(DateTime.Parse(v), DateTimeKind.Utc) : (DateTime?)null
        );

        // Apply converters to every DateTime / DateTime? column across all entities
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                    property.SetValueConverter(utcConverter);
                else if (property.ClrType == typeof(DateTime?))
                    property.SetValueConverter(nullableUtcConverter);
            }
        }
    }
}
