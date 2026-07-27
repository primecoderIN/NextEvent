using Domain;
using Domain.Constants;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Persistence;

/// <summary>
/// Handles seeding initial data into the database when the application starts.
/// Belongs to the Persistence layer as it interacts directly with EF Core and Identity.
/// </summary>
public class DBInitializer
{
    public static async Task SeedData(AppDBContext context, RoleManager<IdentityRole> roleManager, UserManager<User> userManager)
    {
        var roles = new List<string> { RoleConstants.Member, RoleConstants.Organizer, RoleConstants.Admin };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        if (!userManager.Users.Any())
        {
            var admin = new User { UserName = "admin", Email = "admin@test.com", DisplayName = "Admin User" };
            await userManager.CreateAsync(admin, "Pa$$w0rd");
            await userManager.AddToRoleAsync(admin, RoleConstants.Admin);

            var organizer = new User { UserName = "organizer", Email = "organizer@test.com", DisplayName = "Organizer User" };
            await userManager.CreateAsync(organizer, "Pa$$w0rd");
            await userManager.AddToRoleAsync(organizer, RoleConstants.Organizer);

            var member = new User { UserName = "member", Email = "member@test.com", DisplayName = "Member User" };
            await userManager.CreateAsync(member, "Pa$$w0rd");
            await userManager.AddToRoleAsync(member, RoleConstants.Member);
        }

        // -----------------------------------------------------------------
        // Seed organization permissions (idempotent)
        //
        // 1. Global Catalogue Setup: We populate the central Permissions table with 
        //    all available permissions defined in codebase (PermissionConstants.All).
        //    This table is global and organization-independent — it is the catalogue every org draws from.
        //
        // 4. Why it's done this way: By doing this upsert, it guarantees that if you ever change 
        //    a permission's description, name, or category in C# code, the DB will automatically 
        //    sync those display labels on app restart, without requiring a manual migration.
        // -----------------------------------------------------------------
        
        // 2. Fetching Existing Records: Query the DB for all permission Codes already saved 
        //    and store in a highly-efficient HashSet. Code acts as the stable unique identifier (anchor).
        var existingCodes = await context.Permissions
            .AsNoTracking()
            .Select(p => p.Code)
            .ToHashSetAsync();

        bool permissionsChanged = false;

        // 3. Insert or Update (Upsert): Loop through every permission currently defined
        foreach (var (code, name, description, category) in PermissionConstants.All)
        {
            if (!existingCodes.Contains(code))
            {
                // 3a. Insert (New): Code not found in DB, insert a brand new Permission record.
                context.Permissions.Add(new Permission
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
                // 3b. Update (Existing): Code exists, check if human-readable fields differ.
                // If they differ, update the existing DB record to sync with codebase.
                var existing = await context.Permissions.SingleAsync(p => p.Code == code);
                if (existing.Name != name || existing.Description != description || existing.Category != category)
                {
                    existing.Name        = name;
                    existing.Description = description;
                    existing.Category    = category;
                    permissionsChanged   = true;
                }
            }
        }

        // 5. Saving Changes: Track if inserts/updates occurred. Only hit the database 
        //    with SaveChangesAsync if actual modifications were made for efficiency.
        if (permissionsChanged)
        {
            await context.SaveChangesAsync();
        }

        if (await context.Events.AnyAsync())
        {
            return; // If events already exist, do not seed
        }

        // Seed initial categories (idempotent) to match frontend CATEGORIES
        var initialCategories = new List<Category>
        {
            new() { Name = "Music", Slug = "music", Description = "Music events and concerts" },
            new() { Name = "Nightlife", Slug = "nightlife", Description = "Nightlife and club events" },
            new() { Name = "Workshop", Slug = "workshop", Description = "Educational workshops" },
            new() { Name = "Sports", Slug = "sports", Description = "Sporting events and competitions" },
            new() { Name = "Business", Slug = "business", Description = "Conferences and business meetups" },
            new() { Name = "Other", Slug = "other", Description = "Miscellaneous events" }
        };

        foreach (var cat in initialCategories)
        {
            // Use Slug uniqueness to ensure idempotent seeding
            var exists = await context.Categories.AnyAsync(c => c.Slug == cat.Slug);
            if (!exists)
            {
                // Ensure timestamps are set correctly on insert
                cat.CreatedAtUtc = DateTime.UtcNow;
                cat.UpdatedAtUtc = DateTime.UtcNow;
                context.Categories.Add(cat);
            }
        }
        await context.SaveChangesAsync();

        var categoriesInDb = await context.Categories.ToListAsync();

        // Seed some category suggestions
        var memberUser = await userManager.FindByNameAsync("member");
        if (memberUser != null && !await context.CategorySuggestions.AnyAsync())
        {
            var suggestions = new List<CategorySuggestion>
            {
                new()
                {
                    Name = "Gaming",
                    Slug = "gaming",
                    Description = "Esports and video game tournaments",
                    SuggestedById = memberUser.Id,
                    Status = CategorySuggestionStatus.Pending
                },
                new()
                {
                    Name = "Art Exhibitions",
                    Slug = "art-exhibitions",
                    Description = "Local and international art galleries",
                    SuggestedById = memberUser.Id,
                    Status = CategorySuggestionStatus.Pending
                }
            };

            context.CategorySuggestions.AddRange(suggestions);
            await context.SaveChangesAsync();
        }

        var events = new List<Event>
        {
            new()
            {
                Title = "Tech Conference 2026",
                Description = "Annual technology conference for developers and architects.",
                CategoryId = categoriesInDb.Single(c => c.Slug == "business").Id,
                Date = DateTime.UtcNow.AddDays(15),
                TimeZoneId = "Asia/Kolkata",
                City = "Bangalore",
                Venue = "Bangalore International Exhibition Centre",
                Latitude = 13.0280,
                Longitude = 77.5890
            },

            new()
            {
                Title = "Startup Networking Meetup",
                Description = "Connect with founders, investors, and entrepreneurs.",
                CategoryId = categoriesInDb.Single(c => c.Slug == "business").Id,
                Date = DateTime.UtcNow.AddDays(30),
                TimeZoneId = "Asia/Kolkata",
                City = "Hyderabad",
                Venue = "HITEX Convention Center",
                Latitude = 17.4474,
                Longitude = 78.3762
            },

            new()
            {
                Title = "Music Festival",
                Description = "Live performances from top artists across the country.",
                CategoryId = categoriesInDb.Single(c => c.Slug == "music").Id,
                Date = DateTime.UtcNow.AddDays(45),
                TimeZoneId = "Asia/Kolkata",
                City = "Mumbai",
                Venue = "Jio World Garden",
                Latitude = 19.0596,
                Longitude = 72.8295
            },

            new()
            {
                Title = "Marathon 2026",
                Description = "A city-wide marathon open to runners of all levels.",
                CategoryId = categoriesInDb.Single(c => c.Slug == "sports").Id,
                Date = DateTime.UtcNow.AddDays(60),
                TimeZoneId = "Asia/Kolkata",
                City = "Delhi",
                Venue = "Jawaharlal Nehru Stadium",
                Latitude = 28.5823,
                Longitude = 77.2337
            },

            new()
            {
                Title = "Food Carnival",
                Description = "Experience cuisines from around the world.",
                CategoryId = categoriesInDb.Single(c => c.Slug == "other").Id,
                Date = DateTime.UtcNow.AddDays(75),
                TimeZoneId = "Asia/Kolkata",
                City = "Chennai",
                Venue = "Island Grounds",
                Latitude = 13.0827,
                Longitude = 80.2707
            }
        };

        context.Events.AddRange(events); //Tracking events inside the memory
        await context.SaveChangesAsync(); //Saving the changes in the database
    }
}
