using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextEvent.Modules.Organizations.Domain;

namespace NextEvent.Modules.Organizations.Persistence.Configurations;

public class OrganizationRoleConfiguration : IEntityTypeConfiguration<OrganizationRole>
{
    public void Configure(EntityTypeBuilder<OrganizationRole> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(80)
            .HasColumnType("varchar(80)");

        builder.Property(r => r.IsSystemRole)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(r => r.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        // Foreign keys
        builder.HasOne(r => r.Organization)
            .WithMany()
            .HasForeignKey(r => r.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.CreatedByUser)
            .WithMany()
            .HasForeignKey(r => r.CreatedByUserId)
            .HasConstraintName("FK_OrganizationRoles_CreatedBy_UserId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.UpdatedByUser)
            .WithMany()
            .HasForeignKey(r => r.UpdatedByUserId)
            .HasConstraintName("FK_OrganizationRoles_UpdatedBy_UserId")
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(r => new { r.OrganizationId, r.Name })
            .IsUnique()
            .HasDatabaseName("UX_OrganizationRoles_OrganizationId_Name");

        // Timestamps
        builder.Property(r => r.CreatedAtUtc).IsRequired().HasColumnType("datetime2(3)");
        builder.Property(r => r.UpdatedAtUtc).HasColumnType("datetime2(3)");
    }
}
