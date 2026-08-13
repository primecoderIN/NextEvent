using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextEvent.Modules.Events.Domain;

namespace NextEvent.Modules.Events.Persistence.Configurations;

public class EventReportConfiguration : IEntityTypeConfiguration<EventReport>
{
    public void Configure(EntityTypeBuilder<EventReport> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Reason)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(e => e.ReportedById)
            .IsRequired()
            .HasMaxLength(450); // Matches typical Identity User ID length

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        // One-to-Many relationship: Event -> EventReports
        builder.HasOne(e => e.EventRef)
            .WithMany() // We aren't adding the collection to Event to keep it clean, unless needed
            .HasForeignKey(e => e.EventId)
            .OnDelete(DeleteBehavior.Cascade); // If an event is deleted, its reports should be too
    }
}
