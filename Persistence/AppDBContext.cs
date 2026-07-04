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
    public DbSet<Category> Categories { get; set; }
    public DbSet<CategorySuggestion> CategorySuggestions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Value converter: store DateTime as UTC ISO-8601 text.
        // This keeps the current database mapping compatible with existing
        // string-backed date columns, including Identity refresh token expiry.
        var utcConverter = new ValueConverter<DateTime, string>(
            v => v.ToUniversalTime().ToString("O"),
            v => DateTime.SpecifyKind(DateTime.Parse(v), DateTimeKind.Utc)
        );

        var nullableUtcConverter = new ValueConverter<DateTime?, string?>(
            v => v.HasValue ? v.Value.ToUniversalTime().ToString("O") : null,
            v => v != null ? DateTime.SpecifyKind(DateTime.Parse(v), DateTimeKind.Utc) : (DateTime?)null
        );

        // Apply converters to every DateTime / DateTime? column across all entities.
        // This prevents `System.String` -> `System.DateTime` cast failures when the
        // current database schema stores dates as text.
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

        // Event entity configuration
        modelBuilder.Entity<Event>(b =>
        {
            b.HasKey(e => e.Id);

            // These properties remain required in the schema.
            b.Property(e => e.Title)
                .IsRequired();

            b.Property(e => e.Description)
                .IsRequired();

            b.Property(e => e.CategoryId)
                .IsRequired(false);

            b.Property(e => e.City)
                .IsRequired();

            b.Property(e => e.Venue)
                .IsRequired();

            // Configure the new optional relationship to Category.
            // CategoryId is nullable so existing events can remain valid.
            b.HasOne(e => e.CategoryRef)
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Category entity configuration
        modelBuilder.Entity<Category>(b =>
        {
            b.HasKey(c => c.Id);

            b.Property(c => c.Name)
                .IsRequired()
                .HasMaxLength(200);

            b.Property(c => c.Slug)
                .IsRequired()
                .HasMaxLength(200);

            b.Property(c => c.Description)
                .HasMaxLength(2000);

            b.Property(c => c.IsActive)
                .HasDefaultValue(true);

            b.Property(c => c.SortOrder)
                .HasDefaultValue(0);

            b.Property(c => c.CreatedAtUtc)
                .IsRequired();

            b.Property(c => c.UpdatedAtUtc)
                .IsRequired();

            b.HasIndex(c => c.Slug).IsUnique();
        });

        // CategorySuggestion entity configuration
        modelBuilder.Entity<CategorySuggestion>(b =>
        {
            b.HasKey(s => s.Id);

            b.Property(s => s.Name).IsRequired().HasMaxLength(200);
            b.Property(s => s.Slug).IsRequired().HasMaxLength(200);
            b.Property(s => s.Description).HasMaxLength(2000);

            // Store enum as integer for efficiency
            b.Property(s => s.Status)
                .HasConversion<int>()
                .HasDefaultValue(CategorySuggestionStatus.Pending);

            // FK: SuggestedBy → AspNetUsers (no cascade — keep suggestion if user deleted)
            b.HasOne(s => s.SuggestedBy)
                .WithMany()
                .HasForeignKey(s => s.SuggestedById)
                .OnDelete(DeleteBehavior.Restrict);

            // FK: ReviewedBy → AspNetUsers (nullable)
            b.HasOne(s => s.ReviewedBy)
                .WithMany()
                .HasForeignKey(s => s.ReviewedById)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // FK: ApprovedCategory → Categories (nullable — only set on approval)
            b.HasOne(s => s.ApprovedCategory)
                .WithMany()
                .HasForeignKey(s => s.ApprovedCategoryId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);

            b.HasIndex(s => s.Status);  // fast admin dashboard filter
        });
    }
}
