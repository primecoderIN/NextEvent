using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextEvent.Modules.Organizations.Domain;

namespace NextEvent.Modules.Organizations.Persistence.Configurations;

public class OrganizationConfiguration : IEntityTypeConfiguration<Organization>
{
    public void Configure(EntityTypeBuilder<Organization> builder)
    {
        builder.HasKey(o => o.Id);

        // Column constraints
        builder.Property(o => o.Name)
            .IsRequired()
            .HasMaxLength(160)
            .HasColumnType("varchar(160)");

        builder.Property(o => o.Slug)
            .IsRequired()
            .HasMaxLength(180)
            .HasColumnType("varchar(180)");

        builder.Property(o => o.Description)
            .IsRequired(false);

        builder.Property(o => o.LogoUrl)
            .IsRequired(false);

        builder.Property(o => o.CoverImageUrl)
            .IsRequired(false);

        builder.Property(o => o.WebsiteUrl)
            .IsRequired(false);

        builder.Property(o => o.ContactEmail)
            .IsRequired(false)
            .HasMaxLength(256)
            .HasColumnType("varchar(256)");

        builder.Property(o => o.ContactPhone)
            .IsRequired(false)
            .HasMaxLength(40)
            .HasColumnType("varchar(40)");

        builder.Property(o => o.Status)
            .IsRequired()
            .HasMaxLength(30)
            .HasColumnType("varchar(30)")
            .HasDefaultValue("pending_verification");

        builder.Property(o => o.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        // Concurrency token
        builder.Property(o => o.RowVersion)
            .IsRowVersion()
            .IsConcurrencyToken();

        // Foreign key mappings to User navigation properties
        builder.HasOne(o => o.Owner)
            .WithMany()
            .HasForeignKey(o => o.OwnerUserId)
            .HasConstraintName("FK_Organizations_Owner_UserId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.CreatedBy)
            .WithMany()
            .HasForeignKey(o => o.CreatedByUserId)
            .HasConstraintName("FK_Organizations_CreatedBy_UserId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.VerifiedBy)
            .WithMany()
            .HasForeignKey(o => o.VerifiedByUserId)
            .HasConstraintName("FK_Organizations_VerifiedBy_UserId")
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(o => o.Slug)
            .IsUnique()
            .HasDatabaseName("UX_Organizations_Slug");

        builder.HasIndex(o => o.OwnerUserId)
            .HasDatabaseName("IX_Organizations_OwnerUserId");

        builder.HasIndex(o => o.Status)
            .HasDatabaseName("IX_Organizations_Status");

        // UTC timestamp columns — datetime2(3)
        builder.Property(o => o.VerifiedAtUtc).HasColumnType("datetime2(3)");
        builder.Property(o => o.CreatedAtUtc).IsRequired().HasColumnType("datetime2(3)");
        builder.Property(o => o.UpdatedAtUtc).HasColumnType("datetime2(3)");
        builder.Property(o => o.DeletedAtUtc).HasColumnType("datetime2(3)");
    }
}
