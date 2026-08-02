using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextEvent.Modules.Events.Domain;

namespace NextEvent.Modules.Events.Persistence.Configurations;

public class EventConfiguration : IEntityTypeConfiguration<Event>
{
    public void Configure(EntityTypeBuilder<Event> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title)
            .IsRequired();

        builder.Property(e => e.Description)
            .IsRequired();

        builder.Property(e => e.City)
            .IsRequired();

        builder.Property(e => e.Venue)
            .IsRequired();

        builder.Property(e => e.CategoryId)
            .IsRequired(false);

        builder.HasOne(e => e.CategoryRef)
            .WithMany()
            .HasForeignKey(e => e.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Property(e => e.OrganizationId)
            .IsRequired(false);

        builder.HasOne(e => e.Organization)
            .WithMany()
            .HasForeignKey(e => e.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.OrganizationId)
            .HasDatabaseName("IX_Events_OrganizationId");

        builder.Property(e => e.Date)
            .IsRequired()
            .HasColumnType("datetime2(3)");

        builder.HasIndex(e => e.Date)
            .HasDatabaseName("IX_Events_Date");

        builder.Property(e => e.TimeZoneId)
            .IsRequired()
            .HasMaxLength(50)
            .HasColumnType("varchar(50)")
            .HasDefaultValue("UTC");
    }
}
