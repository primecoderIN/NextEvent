using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextEvent.Modules.Organizations.Domain;

namespace NextEvent.Modules.Organizations.Persistence.Configurations;

public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(120)
            .HasColumnType("varchar(120)");

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(120)
            .HasColumnType("varchar(120)");

        builder.Property(p => p.Category)
            .IsRequired()
            .HasMaxLength(80)
            .HasColumnType("varchar(80)");

        builder.HasIndex(p => p.Code)
            .IsUnique()
            .HasDatabaseName("UX_Permissions_Code");
    }
}
