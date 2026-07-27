using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Configurations;

public class OrganizationConfiguration : IEntityTypeConfiguration<Organization>
{
    public void Configure(EntityTypeBuilder<Organization> builder)
    {
        builder.HasKey(o => o.Id);

        // -----------------------------------------------------------------
        // Column constraints — matching Architecture.md §4.2 SQL Server schema
        // -----------------------------------------------------------------

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

        // -----------------------------------------------------------------
        // RowVersion — SQL Server rowversion, auto-managed concurrency token
        // -----------------------------------------------------------------

        builder.Property(o => o.RowVersion)
            .IsRowVersion()         // maps to SQL Server rowversion
            .IsConcurrencyToken();  // If two users try to edit the same organization at the same time,
                                    // EF will check this token. The second user to save will get a
                                    // DbUpdateConcurrencyException instead of silently overwriting.

        // -----------------------------------------------------------------
        // Foreign keys → AspNetUsers
        // DeleteBehavior.Restrict: prevents deleting a User who owns / created
        // an Organization, forcing explicit cleanup first.
        // -----------------------------------------------------------------

        // OwnerUserId — required, business ownership
        builder.HasOne(o => o.Owner)
            .WithMany()
            .HasForeignKey(o => o.OwnerUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // VerifiedByUserId — optional, set by Admin on approval
        builder.HasOne(o => o.VerifiedBy)
            .WithMany()
            .HasForeignKey(o => o.VerifiedByUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // CreatedByUserId — required, immutable audit
        builder.HasOne(o => o.CreatedBy)
            .WithMany()
            .HasForeignKey(o => o.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // -----------------------------------------------------------------
        // Indexes — matching Architecture.md §4.2
        // -----------------------------------------------------------------

        // UX_Organizations_Slug — slug must be globally unique
        builder.HasIndex(o => o.Slug)
            .IsUnique()
            .HasDatabaseName("UX_Organizations_Slug");

        // IX_Organizations_OwnerUserId — fast lookup of orgs by owner
        builder.HasIndex(o => o.OwnerUserId)
            .HasDatabaseName("IX_Organizations_OwnerUserId");

        // IX_Organizations_Status — fast admin dashboard filter
        builder.HasIndex(o => o.Status)
            .HasDatabaseName("IX_Organizations_Status");

        // -----------------------------------------------------------------
        // Audit timestamp columns — datetime2(3): 6 bytes, ms precision, UTC
        // -----------------------------------------------------------------
        builder.Property(o => o.VerifiedAtUtc).HasColumnType("datetime2(3)");
        builder.Property(o => o.CreatedAtUtc).IsRequired().HasColumnType("datetime2(3)");
        builder.Property(o => o.UpdatedAtUtc).HasColumnType("datetime2(3)");
        builder.Property(o => o.DeletedAtUtc).HasColumnType("datetime2(3)");
    }
}
