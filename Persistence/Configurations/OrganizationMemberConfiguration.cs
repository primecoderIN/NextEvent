using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Configurations;

public class OrganizationMemberConfiguration : IEntityTypeConfiguration<OrganizationMember>
{
    public void Configure(EntityTypeBuilder<OrganizationMember> builder)
    {
        builder.HasKey(m => m.Id);

        // -----------------------------------------------------------------
        // Status — stored as integer for compact storage / fast filtering
        // -----------------------------------------------------------------

        builder.Property(m => m.Status)
            .HasConversion<int>()
            .HasDefaultValue(OrganizationMemberStatus.Invited);

        builder.Property(m => m.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        // -----------------------------------------------------------------
        // Foreign keys
        // -----------------------------------------------------------------

        // OrganizationId — cascade: if the Organization row is hard-deleted
        // (safety net only; we soft-delete), memberships go with it.
        builder.HasOne(m => m.Organization)
            .WithMany()
            .HasForeignKey(m => m.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        // UserId — restrict: cannot delete a User who is still a member
        builder.HasOne(m => m.User)
            .WithMany()
            .HasForeignKey(m => m.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // CreatedByUserId — immutable audit, restrict delete
        builder.HasOne(m => m.CreatedBy)
            .WithMany()
            .HasForeignKey(m => m.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // -----------------------------------------------------------------
        // Indexes
        // -----------------------------------------------------------------

        // Fast lookup: all members of an organization
        builder.HasIndex(m => m.OrganizationId)
            .HasDatabaseName("IX_OrganizationMembers_OrganizationId");

        // Fast lookup: all organizations a user belongs to
        builder.HasIndex(m => m.UserId)
            .HasDatabaseName("IX_OrganizationMembers_UserId");

        // -----------------------------------------------------------------
        // UX_OrganizationMembers_Active — filtered unique index
        // -----------------------------------------------------------------
        // Enforces: at most ONE Active (non-deleted) membership per user
        // per organization.
        //
        // Why a filtered index rather than a composite primary key?
        //   A composite PK on (OrganizationId, UserId) would block a user
        //   from ever rejoining after leaving, because the old row cannot
        //   be deleted (audit trail). The filtered index sidesteps this by
        //   only constraining rows where Status=1 AND IsDeleted=0,
        //   so historical rows (Declined, Removed) are invisible to the
        //   uniqueness check and a user can be re-invited without conflict.
        // -----------------------------------------------------------------
        builder.HasIndex(m => new { m.OrganizationId, m.UserId })
            .IsUnique()
            .HasFilter("[Status] = 1 AND [IsDeleted] = 0")
            .HasDatabaseName("UX_OrganizationMembers_Active");
    }
}
