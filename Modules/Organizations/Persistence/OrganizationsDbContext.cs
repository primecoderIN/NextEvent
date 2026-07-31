using Microsoft.EntityFrameworkCore;
using MassTransit;
using NextEvent.Modules.Organizations.Domain;
using NextEvent.Modules.Identity.Domain;

namespace NextEvent.Modules.Organizations.Persistence.Contexts;

/// <summary>
/// Database context for the Organizations module.
/// Owns: Organization, OrganizationMember, OrganizationRole,
///       OrganizationRolePermission, OrganizationMemberRole, Permission.
/// Uses schema "org" to isolate from other modules.
/// User entity is mapped read-only to "identity.AspNetUsers" (ExcludeFromMigrations)
/// so EF can model FK relationships without owning the table.
/// </summary>
public class OrganizationsDbContext : DbContext
{
    public OrganizationsDbContext(DbContextOptions<OrganizationsDbContext> options)
        : base(options)
    {
    }

    // ── Organizations ────────────────────────────────────────────────────
    public DbSet<Organization> Organizations { get; set; } = null!;
    public DbSet<OrganizationMember> OrganizationMembers { get; set; } = null!;
    public DbSet<OrganizationMemberRole> OrganizationMemberRoles { get; set; } = null!;
    public DbSet<OrganizationRole> OrganizationRoles { get; set; } = null!;
    public DbSet<OrganizationRolePermission> OrganizationRolePermissions { get; set; } = null!;
    public DbSet<Permission> Permissions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.HasDefaultSchema("org");

        // Map User to identity schema — EF knows about it for FK modelling
        // but won't create or migrate the table (it belongs to IdentityDbContext).
        builder.Entity<User>().ToTable("AspNetUsers", "identity", t => t.ExcludeFromMigrations());

        // MassTransit Outbox tables for guaranteed message delivery
        builder.AddInboxStateEntity();
        builder.AddOutboxMessageEntity();
        builder.AddOutboxStateEntity();

        // ── Organization nav-property FK mappings ─────────────────────────
        // Explicitly map each User navigation to the existing string FK column
        // so EF does NOT auto-generate duplicate shadow FK columns (OwnerId,
        // CreatedById, VerifiedById) that would require cross-schema constraints.
        builder.Entity<Organization>(e =>
        {
            e.HasOne(o => o.Owner)
             .WithMany()
             .HasForeignKey(o => o.OwnerUserId)
             .HasConstraintName("FK_Organizations_Owner_UserId")
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(o => o.CreatedBy)
             .WithMany()
             .HasForeignKey(o => o.CreatedByUserId)
             .HasConstraintName("FK_Organizations_CreatedBy_UserId")
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(o => o.VerifiedBy)
             .WithMany()
             .HasForeignKey(o => o.VerifiedByUserId)
             .HasConstraintName("FK_Organizations_VerifiedBy_UserId")
             .IsRequired(false)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── OrganizationRole nav-property FK mappings ─────────────────────
        builder.Entity<OrganizationRole>(e =>
        {
            e.HasOne(r => r.CreatedByUser)
             .WithMany()
             .HasForeignKey(r => r.CreatedByUserId)
             .HasConstraintName("FK_OrganizationRoles_CreatedBy_UserId")
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(r => r.UpdatedByUser)
             .WithMany()
             .HasForeignKey(r => r.UpdatedByUserId)
             .HasConstraintName("FK_OrganizationRoles_UpdatedBy_UserId")
             .IsRequired(false)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── OrganizationMember foreign keys ───────────────────────────────
        builder.Entity<OrganizationMember>()
            .HasOne(m => m.User)
            .WithMany()
            .HasForeignKey(m => m.UserId)
            .HasConstraintName("FK_OrganizationMembers_User_UserId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<OrganizationMember>()
            .HasOne(m => m.CreatedBy)
            .WithMany()
            .HasForeignKey(m => m.CreatedByUserId)
            .HasConstraintName("FK_OrganizationMembers_CreatedBy_UserId")
            .OnDelete(DeleteBehavior.Restrict);

        // ── OrganizationMemberRole primary key & FKs ─────────────────────
        builder.Entity<OrganizationMemberRole>()
            .HasKey(r => new { r.OrganizationMemberId, r.OrganizationRoleId });

        builder.Entity<OrganizationMemberRole>()
            .HasOne(m => m.Role)
            .WithMany(r => r.MemberRoles)
            .HasForeignKey(m => m.OrganizationRoleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<OrganizationMemberRole>()
            .HasOne(m => m.Member)
            .WithMany(m => m.MemberRoles)
            .HasForeignKey(m => m.OrganizationMemberId)
            .OnDelete(DeleteBehavior.Restrict);

        // ── OrganizationRolePermission primary key ────────────────────────
        builder.Entity<OrganizationRolePermission>()
            .HasKey(p => new { p.OrganizationRoleId, p.PermissionId });
    }
}
