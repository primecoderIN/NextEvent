using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Configurations;

public class OrganizationRolePermissionConfiguration : IEntityTypeConfiguration<OrganizationRolePermission>
{
    public void Configure(EntityTypeBuilder<OrganizationRolePermission> builder)
    {
        builder.HasKey(rp => new { rp.OrganizationRoleId, rp.PermissionId });

        // One role can have many permissions; deleting the role cascades to its permission assignments
        builder.HasOne(rp => rp.Role)
            .WithMany(r => r.RolePermissions)
            .HasForeignKey(rp => rp.OrganizationRoleId)
            .OnDelete(DeleteBehavior.Cascade);

        // One permission can belong to many roles; deleting the permission cascades to its role assignments
        builder.HasOne(rp => rp.Permission)
            .WithMany(p => p.RolePermissions)
            .HasForeignKey(rp => rp.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
