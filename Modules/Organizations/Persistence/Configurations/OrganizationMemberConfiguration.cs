using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextEvent.Modules.Organizations.Domain;

namespace NextEvent.Modules.Organizations.Persistence.Configurations;

public class OrganizationMemberConfiguration : IEntityTypeConfiguration<OrganizationMember>
{
    public void Configure(EntityTypeBuilder<OrganizationMember> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Status)
            .HasConversion<int>()
            .HasDefaultValue(OrganizationMemberStatus.Invited);

        builder.Property(m => m.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        // Foreign keys
        builder.HasOne(m => m.Organization)
            .WithMany()
            .HasForeignKey(m => m.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.User)
            .WithMany()
            .HasForeignKey(m => m.UserId)
            .HasConstraintName("FK_OrganizationMembers_User_UserId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.CreatedBy)
            .WithMany()
            .HasForeignKey(m => m.CreatedByUserId)
            .HasConstraintName("FK_OrganizationMembers_CreatedBy_UserId")
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(m => m.OrganizationId)
            .HasDatabaseName("IX_OrganizationMembers_OrganizationId");

        builder.HasIndex(m => m.UserId)
            .HasDatabaseName("IX_OrganizationMembers_UserId");

        builder.HasIndex(m => new { m.OrganizationId, m.UserId })
            .IsUnique()
            .HasFilter("[Status] = 1 AND [IsDeleted] = 0")
            .HasDatabaseName("UX_OrganizationMembers_Active");

        // Timestamps
        builder.Property(m => m.JoinedAtUtc).HasColumnType("datetime2(3)");
        builder.Property(m => m.CreatedAtUtc).IsRequired().HasColumnType("datetime2(3)");
        builder.Property(m => m.DeletedAtUtc).HasColumnType("datetime2(3)");
    }
}
