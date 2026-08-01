using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextEvent.Modules.Organizations.Domain;

namespace NextEvent.Modules.Organizations.Persistence.Configurations;

public class OrganizationMemberRoleConfiguration : IEntityTypeConfiguration<OrganizationMemberRole>
{
    public void Configure(EntityTypeBuilder<OrganizationMemberRole> builder)
    {
        builder.HasKey(mr => new { mr.OrganizationMemberId, mr.OrganizationRoleId });

        builder.HasOne(mr => mr.Member)
            .WithMany(m => m.MemberRoles)
            .HasForeignKey(mr => mr.OrganizationMemberId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(mr => mr.Role)
            .WithMany(r => r.MemberRoles)
            .HasForeignKey(mr => mr.OrganizationRoleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
