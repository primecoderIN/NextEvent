using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Configurations;

public class OrganizationMemberRoleConfiguration : IEntityTypeConfiguration<OrganizationMemberRole>
{
    public void Configure(EntityTypeBuilder<OrganizationMemberRole> builder)
    {
        builder.HasKey(mr => new { mr.OrganizationMemberId, mr.OrganizationRoleId });

        // One organization member can have many roles; deleting the member cascades to their role assignments
        builder.HasOne(mr => mr.Member)
            .WithMany(m => m.MemberRoles)
            .HasForeignKey(mr => mr.OrganizationMemberId)
            .OnDelete(DeleteBehavior.Cascade);

        // One organization role can be assigned to many members.
        // Restrict (not Cascade) to avoid SQL Server multi-cascade-path error
        // since OrganizationMember already cascades from Organization.
        builder.HasOne(mr => mr.Role)
            .WithMany(r => r.MemberRoles)
            .HasForeignKey(mr => mr.OrganizationRoleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
