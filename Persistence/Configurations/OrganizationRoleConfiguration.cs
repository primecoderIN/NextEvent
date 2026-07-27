using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Configurations;

public class OrganizationRoleConfiguration : IEntityTypeConfiguration<OrganizationRole>
{
    public void Configure(EntityTypeBuilder<OrganizationRole> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name).IsRequired().HasMaxLength(80).HasColumnType("varchar(80)");

        builder.Property(r => r.IsSystemRole).HasDefaultValue(false);
        builder.Property(r => r.IsDeleted).HasDefaultValue(false);

        // Organization FK — deleting an Organization cascades to its roles
        builder.HasOne(r => r.Organization)
            .WithMany()
            .HasForeignKey(r => r.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        // User FKs — restrict: cannot delete a User who created / last updated a role
        builder.HasOne(r => r.CreatedByUser)
            .WithMany()
            .HasForeignKey(r => r.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.UpdatedByUser)
            .WithMany()
            .HasForeignKey(r => r.UpdatedByUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // Unique role name per organization
        builder.HasIndex(r => new { r.OrganizationId, r.Name })
            .IsUnique()
            .HasDatabaseName("UX_OrganizationRoles_OrganizationId_Name");
    }
}
