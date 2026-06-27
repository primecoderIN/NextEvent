using Domain;
using Microsoft.EntityFrameworkCore;

namespace Persistence;

/// <summary>
/// Handles seeding initial data into the database when the application starts.
/// Belongs to the Persistence layer as it interacts directly with EF Core and Identity.
/// </summary>
public class DBInitializer
{
    public static async Task SeedData(AppDBContext context, Microsoft.AspNetCore.Identity.RoleManager<Microsoft.AspNetCore.Identity.IdentityRole> roleManager, Microsoft.AspNetCore.Identity.UserManager<User> userManager)
    {
        var roles = new List<string> { "Member", "Organizer", "Admin" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new Microsoft.AspNetCore.Identity.IdentityRole(role));
            }
        }

        if (!userManager.Users.Any())
        {
            var admin = new User { UserName = "admin", Email = "admin@test.com", DisplayName = "Admin User" };
            await userManager.CreateAsync(admin, "Pa$$w0rd");
            await userManager.AddToRoleAsync(admin, "Admin");

            var organizer = new User { UserName = "organizer", Email = "organizer@test.com", DisplayName = "Organizer User" };
            await userManager.CreateAsync(organizer, "Pa$$w0rd");
            await userManager.AddToRoleAsync(organizer, "Organizer");

            var member = new User { UserName = "member", Email = "member@test.com", DisplayName = "Member User" };
            await userManager.CreateAsync(member, "Pa$$w0rd");
            await userManager.AddToRoleAsync(member, "Member");
        }

        if (await context.Events.AnyAsync())
        {
            return; // If events already exist, do not seed
        }


        var events = new List<Event>
        {
            new() {
                Title = "Tech Conference 2026",
                Description = "Annual technology conference for developers and architects.",
                Category = "Technology",
                Date = DateTime.UtcNow.AddDays(15),
                City = "Bangalore",
                Venue = "Bangalore International Exhibition Centre",
                Latitude = 13.0280,
                Longitude = 77.5890
            },

            new() {
                Title = "Startup Networking Meetup",
                Description = "Connect with founders, investors, and entrepreneurs.",
                Category = "Business",
                Date = DateTime.UtcNow.AddDays(30),
                City = "Hyderabad",
                Venue = "HITEX Convention Center",
                Latitude = 17.4474,
                Longitude = 78.3762
            },

            new() {
                Title = "Music Festival",
                Description = "Live performances from top artists across the country.",
                Category = "Music",
                Date = DateTime.UtcNow.AddDays(45),
                City = "Mumbai",
                Venue = "Jio World Garden",
                Latitude = 19.0596,
                Longitude = 72.8295
            },

            new() {
                Title = "Marathon 2026",
                Description = "A city-wide marathon open to runners of all levels.",
                Category = "Sports",
                Date = DateTime.UtcNow.AddDays(60),
                City = "Delhi",
                Venue = "Jawaharlal Nehru Stadium",
                Latitude = 28.5823,
                Longitude = 77.2337
            },

            new() {
                Title = "Food Carnival",
                Description = "Experience cuisines from around the world.",
                Category = "Food",
                Date = DateTime.UtcNow.AddDays(75),
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