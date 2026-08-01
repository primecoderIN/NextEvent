using Microsoft.EntityFrameworkCore;
using NextEvent.Modules.Organizations.Domain;
using NextEvent.Modules.Organizations.Persistence.Contexts;
using NextEvent.Shared.Constants;

namespace NextEvent.Modules.Organizations.Persistence.Seeders;

public static class OrganizationsDataSeeder
{
    public static async Task SeedAsync(OrganizationsDbContext orgContext)
    {
        var existingCodes = await orgContext.Permissions
            .AsNoTracking()
            .Select(p => p.Code)
            .ToHashSetAsync();

        bool permissionsChanged = false;

        foreach (var (code, name, description, category) in PermissionConstants.All)
        {
            if (!existingCodes.Contains(code))
            {
                orgContext.Permissions.Add(new Permission
                {
                    Code        = code,
                    Name        = name,
                    Description = description,
                    Category    = category
                });
                permissionsChanged = true;
            }
            else
            {
                var existing = await orgContext.Permissions.SingleAsync(p => p.Code == code);
                if (existing.Name != name || existing.Description != description || existing.Category != category)
                {
                    existing.Name        = name;
                    existing.Description = description;
                    existing.Category    = category;
                    permissionsChanged   = true;
                }
            }
        }

        if (permissionsChanged)
        {
            await orgContext.SaveChangesAsync();
        }
    }
}
