using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Configurations;

public class EventConfiguration : IEntityTypeConfiguration<Event>
{
    public void Configure(EntityTypeBuilder<Event> builder)
    {
        builder.HasKey(e => e.Id);

        // These properties remain required in the schema.
        builder.Property(e => e.Title)
            .IsRequired();

        builder.Property(e => e.Description)
            .IsRequired();

        builder.Property(e => e.CategoryId)
            .IsRequired(false);

        builder.Property(e => e.City)
            .IsRequired();

        builder.Property(e => e.Venue)
            .IsRequired();

        // Configure the new optional relationship to Category.
        // CategoryId is nullable so existing events can remain valid.
        builder.HasOne(e => e.CategoryRef)
            .WithMany()
            .HasForeignKey(e => e.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        // Configure the optional relationship to Organization.
        // OrganizationId is nullable: existing events without an org remain valid.
        // Restrict delete: an Organization cannot be deleted while it still owns events —
        // events must be transferred or removed first (prevents silent data loss).
        builder.Property(e => e.OrganizationId)
            .IsRequired(false);

        builder.HasOne(e => e.Organization)
            .WithMany()
            .HasForeignKey(e => e.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        // Index for fast lookup of all events belonging to an organization.
        builder.HasIndex(e => e.OrganizationId)
            .HasDatabaseName("IX_Events_OrganizationId");
    }
}
