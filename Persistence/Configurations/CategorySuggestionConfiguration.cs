using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Configurations;

public class CategorySuggestionConfiguration : IEntityTypeConfiguration<CategorySuggestion>
{
    public void Configure(EntityTypeBuilder<CategorySuggestion> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name).IsRequired().HasMaxLength(200);
        builder.Property(s => s.Slug).IsRequired().HasMaxLength(200);
        builder.Property(s => s.Description).HasMaxLength(2000);

        // Store enum as integer for efficiency
        builder.Property(s => s.Status)
            .HasConversion<int>()
            .HasDefaultValue(CategorySuggestionStatus.Pending);

        // FK: SuggestedBy → AspNetUsers (no cascade — keep suggestion if user deleted)
        builder.HasOne(s => s.SuggestedBy)
            .WithMany()
            .HasForeignKey(s => s.SuggestedById)
            .OnDelete(DeleteBehavior.Restrict);

        // FK: ReviewedBy → AspNetUsers (nullable)
        builder.HasOne(s => s.ReviewedBy)
            .WithMany()
            .HasForeignKey(s => s.ReviewedById)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // FK: ApprovedCategory → Categories (nullable — only set on approval)
        builder.HasOne(s => s.ApprovedCategory)
            .WithMany()
            .HasForeignKey(s => s.ApprovedCategoryId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasIndex(s => s.Status); // fast admin dashboard filter
    }
}
