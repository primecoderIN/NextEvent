using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextEvent.Modules.Organizations.Domain;

namespace NextEvent.Modules.Organizations.Persistence.Configurations;

public class OrganizationRolePermissionConfiguration : IEntityTypeConfiguration<OrganizationRolePermission>
{
    public void Configure(EntityTypeBuilder<OrganizationRolePermission> builder)
    {
        builder.HasKey(rp => new { rp.OrganizationRoleId, rp.PermissionId });

        builder.HasOne(rp => rp.Role)
            .WithMany(r => r.RolePermissions)
            .HasForeignKey(rp => rp.OrganizationRoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(rp => rp.Permission)
            .WithMany(p => p.RolePermissions)
            .HasForeignKey(rp => rp.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
