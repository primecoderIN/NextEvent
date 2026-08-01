using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextEvent.Modules.Events.Domain;

namespace NextEvent.Modules.Events.Persistence.Configurations;

public class CategorySuggestionConfiguration : IEntityTypeConfiguration<CategorySuggestion>
{
    public void Configure(EntityTypeBuilder<CategorySuggestion> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Slug)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Description)
            .HasMaxLength(2000);

        builder.Property(s => s.Status)
            .HasConversion<int>()
            .HasDefaultValue(CategorySuggestionStatus.Pending);

        builder.HasOne(s => s.SuggestedBy)
            .WithMany()
            .HasForeignKey(s => s.SuggestedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.ReviewedBy)
            .WithMany()
            .HasForeignKey(s => s.ReviewedById)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasOne(s => s.ApprovedCategory)
            .WithMany()
            .HasForeignKey(s => s.ApprovedCategoryId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasIndex(s => s.Status);

        builder.Property(s => s.ReviewedAt).HasColumnType("datetime2(3)");
        builder.Property(s => s.CreatedAtUtc).IsRequired().HasColumnType("datetime2(3)");
        builder.Property(s => s.UpdatedAtUtc).IsRequired().HasColumnType("datetime2(3)");
    }
}
