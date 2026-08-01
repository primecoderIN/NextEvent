using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextEvent.Modules.Identity.Domain;

namespace NextEvent.Modules.Identity.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.Property(u => u.DisplayName)
            .HasMaxLength(160)
            .HasColumnType("varchar(160)");

        builder.Property(u => u.Bio)
            .HasMaxLength(500)
            .HasColumnType("varchar(500)");

        builder.Property(u => u.ImageUrl)
            .HasMaxLength(2048)
            .HasColumnType("varchar(2048)");

        builder.Property(u => u.RefreshToken)
            .HasMaxLength(256)
            .HasColumnType("varchar(256)");

        builder.Property(u => u.ActiveProfile)
            .IsRequired()
            .HasMaxLength(30)
            .HasColumnType("varchar(30)")
            .HasDefaultValue("Member");

        builder.Property(u => u.RefreshTokenExpiryTime)
            .HasColumnType("datetime2(3)");
    }
}
