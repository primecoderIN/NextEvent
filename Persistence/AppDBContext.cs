using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Application.Core.Interfaces;

namespace Persistence;

// Implementing IAppDBContext allows the Application layer to use the DB 
// without directly referencing Entity Framework or the Persistence project.
public class AppDBContext(DbContextOptions options) : IdentityDbContext<User>(options), IAppDBContext //Whatever options we passed from program.cs has to be passed to DbContext
{
    public DbSet<Event> Events { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<CategorySuggestion> CategorySuggestions { get; set; }
    public DbSet<Organization> Organizations { get; set; }
    public DbSet<OrganizationMember> OrganizationMembers { get; set; }

    public DbSet<Permission> Permissions { get; set; }
    public DbSet<OrganizationRole> OrganizationRoles { get; set; }
    public DbSet<OrganizationRolePermission> OrganizationRolePermissions { get; set; }
    public DbSet<OrganizationMemberRole> OrganizationMemberRoles { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);



        // Event entity configuration
        modelBuilder.Entity<Event>(b =>
        {
            b.HasKey(e => e.Id);

            // These properties remain required in the schema.
            b.Property(e => e.Title)
                .IsRequired();

            b.Property(e => e.Description)
                .IsRequired();

            b.Property(e => e.CategoryId)
                .IsRequired(false);

            b.Property(e => e.City)
                .IsRequired();

            b.Property(e => e.Venue)
                .IsRequired();

            // Configure the new optional relationship to Category.
            // CategoryId is nullable so existing events can remain valid.
            b.HasOne(e => e.CategoryRef)
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Category entity configuration
        modelBuilder.Entity<Category>(b =>
        {
            b.HasKey(c => c.Id);

            b.Property(c => c.Name)
                .IsRequired()
                .HasMaxLength(200);

            b.Property(c => c.Slug)
                .IsRequired()
                .HasMaxLength(200);

            b.Property(c => c.Description)
                .HasMaxLength(2000);

            b.Property(c => c.IsActive)
                .HasDefaultValue(true);

            b.Property(c => c.SortOrder)
                .HasDefaultValue(0);

            b.Property(c => c.CreatedAtUtc)
                .IsRequired();

            b.Property(c => c.UpdatedAtUtc)
                .IsRequired();

            b.HasIndex(c => c.Slug).IsUnique();
        });

        // CategorySuggestion entity configuration
        modelBuilder.Entity<CategorySuggestion>(b =>
        {
            b.HasKey(s => s.Id);

            b.Property(s => s.Name).IsRequired().HasMaxLength(200);
            b.Property(s => s.Slug).IsRequired().HasMaxLength(200);
            b.Property(s => s.Description).HasMaxLength(2000);

            // Store enum as integer for efficiency
            b.Property(s => s.Status)
                .HasConversion<int>()
                .HasDefaultValue(CategorySuggestionStatus.Pending);

            // FK: SuggestedBy → AspNetUsers (no cascade — keep suggestion if user deleted)
            b.HasOne(s => s.SuggestedBy)
                .WithMany()
                .HasForeignKey(s => s.SuggestedById)
                .OnDelete(DeleteBehavior.Restrict);

            // FK: ReviewedBy → AspNetUsers (nullable)
            b.HasOne(s => s.ReviewedBy)
                .WithMany()
                .HasForeignKey(s => s.ReviewedById)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // FK: ApprovedCategory → Categories (nullable — only set on approval)
            b.HasOne(s => s.ApprovedCategory)
                .WithMany()
                .HasForeignKey(s => s.ApprovedCategoryId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);

            b.HasIndex(s => s.Status);  // fast admin dashboard filter
        });

        // Organization entity configuration
        modelBuilder.Entity<Organization>(b =>
        {
            b.HasKey(o => o.Id);

            // -----------------------------------------------------------------
            // Column constraints — matching Architecture.md §4.2 SQL Server schema
            // -----------------------------------------------------------------

            b.Property(o => o.Name)
                .IsRequired()
                .HasMaxLength(160)
                .HasColumnType("varchar(160)");

            b.Property(o => o.Slug)
                .IsRequired()
                .HasMaxLength(180)
                .HasColumnType("varchar(180)");

            b.Property(o => o.Description)
                .IsRequired(false);

            b.Property(o => o.LogoUrl)
                .IsRequired(false);

            b.Property(o => o.CoverImageUrl)
                .IsRequired(false);

            b.Property(o => o.WebsiteUrl)
                .IsRequired(false);

            b.Property(o => o.ContactEmail)
                .IsRequired(false)
                .HasMaxLength(256)
                .HasColumnType("varchar(256)");

            b.Property(o => o.ContactPhone)
                .IsRequired(false)
                .HasMaxLength(40)
                .HasColumnType("varchar(40)");

            b.Property(o => o.Status)
                .IsRequired()
                .HasMaxLength(30)
                .HasColumnType("varchar(30)")
                .HasDefaultValue("pending_verification");

            b.Property(o => o.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            // -----------------------------------------------------------------
            // RowVersion — SQL Server rowversion, auto-managed concurrency token
            // -----------------------------------------------------------------

            b.Property(o => o.RowVersion)
                .IsRowVersion()          // maps to SQL Server rowversion
                .IsConcurrencyToken();   // EF optimistic concurrency guard

            // -----------------------------------------------------------------
            // Foreign keys → AspNetUsers
            // DeleteBehavior.Restrict: prevents deleting a User who owns / created
            // an Organization, forcing explicit cleanup first.
            // -----------------------------------------------------------------

            // OwnerUserId — required, business ownership
            b.HasOne(o => o.Owner)
                .WithMany()
                .HasForeignKey(o => o.OwnerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // VerifiedByUserId — optional, set by Admin on approval
            b.HasOne(o => o.VerifiedBy)
                .WithMany()
                .HasForeignKey(o => o.VerifiedByUserId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // CreatedByUserId — required, immutable audit
            b.HasOne(o => o.CreatedBy)
                .WithMany()
                .HasForeignKey(o => o.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // -----------------------------------------------------------------
            // Indexes — matching Architecture.md §4.2
            // -----------------------------------------------------------------

            // UX_Organizations_Slug — slug must be globally unique
            b.HasIndex(o => o.Slug)
                .IsUnique()
                .HasDatabaseName("UX_Organizations_Slug");

            // IX_Organizations_OwnerUserId — fast lookup of orgs by owner
            b.HasIndex(o => o.OwnerUserId)
                .HasDatabaseName("IX_Organizations_OwnerUserId");

            // IX_Organizations_Status — fast admin dashboard filter
            b.HasIndex(o => o.Status)
                .HasDatabaseName("IX_Organizations_Status");
        });

        // OrganizationMember entity configuration
        modelBuilder.Entity<OrganizationMember>(b =>
        {
            b.HasKey(m => m.Id);

            // -----------------------------------------------------------------
            // Status — stored as integer for compact storage / fast filtering
            // -----------------------------------------------------------------

            b.Property(m => m.Status)
                .HasConversion<int>()
                .HasDefaultValue(OrganizationMemberStatus.Invited);

            b.Property(m => m.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            // -----------------------------------------------------------------
            // Foreign keys
            // -----------------------------------------------------------------

            // OrganizationId — cascade: if the Organization row is hard-deleted
            // (safety net only; we soft-delete), memberships go with it.
            b.HasOne(m => m.Organization)
                .WithMany()
                .HasForeignKey(m => m.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            // UserId — restrict: cannot delete a User who is still a member
            b.HasOne(m => m.User)
                .WithMany()
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // CreatedByUserId — immutable audit, restrict delete
            b.HasOne(m => m.CreatedBy)
                .WithMany()
                .HasForeignKey(m => m.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // -----------------------------------------------------------------
            // Indexes
            // -----------------------------------------------------------------

            // Fast lookup: all members of an organization
            b.HasIndex(m => m.OrganizationId)
                .HasDatabaseName("IX_OrganizationMembers_OrganizationId");

            // Fast lookup: all organizations a user belongs to
            b.HasIndex(m => m.UserId)
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
            b.HasIndex(m => new { m.OrganizationId, m.UserId })
                .IsUnique()
                .HasFilter("[Status] = 1 AND [IsDeleted] = 0")
                .HasDatabaseName("UX_OrganizationMembers_Active");
        });

        // Permission entity configuration
        modelBuilder.Entity<Permission>(b =>
        {
            b.HasKey(p => p.Id);

            b.Property(p => p.Code).IsRequired().HasMaxLength(120).HasColumnType("varchar(120)");
            b.Property(p => p.Name).IsRequired().HasMaxLength(120).HasColumnType("varchar(120)");
            b.Property(p => p.Category).IsRequired().HasMaxLength(80).HasColumnType("varchar(80)");

            b.HasIndex(p => p.Code).IsUnique().HasDatabaseName("UX_Permissions_Code");
        });

        // OrganizationRole entity configuration
        modelBuilder.Entity<OrganizationRole>(b =>
        {
            b.HasKey(r => r.Id);

            b.Property(r => r.Name).IsRequired().HasMaxLength(80).HasColumnType("varchar(80)");
            
            b.Property(r => r.IsSystemRole).HasDefaultValue(false);
            b.Property(r => r.IsDeleted).HasDefaultValue(false);

            // Organization FK
            b.HasOne(r => r.Organization)
                .WithMany()
                .HasForeignKey(r => r.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            // User FKs
            b.HasOne(r => r.CreatedByUser)
                .WithMany()
                .HasForeignKey(r => r.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(r => r.UpdatedByUser)
                .WithMany()
                .HasForeignKey(r => r.UpdatedByUserId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // Unique index per organization for role name
            b.HasIndex(r => new { r.OrganizationId, r.Name })
                .IsUnique()
                .HasDatabaseName("UX_OrganizationRoles_OrganizationId_Name");
        });

        // OrganizationRolePermission entity configuration
        modelBuilder.Entity<OrganizationRolePermission>(b =>
        {
            b.HasKey(rp => new { rp.OrganizationRoleId, rp.PermissionId });

            b.HasOne(rp => rp.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(rp => rp.OrganizationRoleId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(rp => rp.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(rp => rp.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // OrganizationMemberRole entity configuration
        modelBuilder.Entity<OrganizationMemberRole>(b =>
        {
            b.HasKey(mr => new { mr.OrganizationMemberId, mr.OrganizationRoleId });

            b.HasOne(mr => mr.Member)
                .WithMany(m => m.MemberRoles)
                .HasForeignKey(mr => mr.OrganizationMemberId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(mr => mr.Role)
                .WithMany(r => r.MemberRoles)
                .HasForeignKey(mr => mr.OrganizationRoleId)
                // If a role is deleted, we cascade delete the member assignments (changed to Restrict to avoid SQL Server cycle error)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
