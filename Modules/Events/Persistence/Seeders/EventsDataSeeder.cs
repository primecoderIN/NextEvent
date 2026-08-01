using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NextEvent.Modules.Events.Domain;
using NextEvent.Modules.Events.Persistence.Contexts;
using NextEvent.Modules.Identity.Domain;

namespace NextEvent.Modules.Events.Persistence.Seeders;

public static class EventsDataSeeder
{
    public static async Task SeedAsync(
        EventsDbContext eventsContext,
        UserManager<User> userManager)
    {
        if (await eventsContext.Events.AnyAsync())
        {
            return;
        }

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
            var exists = await eventsContext.Categories.AnyAsync(c => c.Slug == cat.Slug);
            if (!exists)
            {
                cat.CreatedAtUtc = DateTime.UtcNow;
                cat.UpdatedAtUtc = DateTime.UtcNow;
                eventsContext.Categories.Add(cat);
            }
        }
        await eventsContext.SaveChangesAsync();

        var categoriesInDb = await eventsContext.Categories.ToListAsync();

        var memberUser = await userManager.FindByNameAsync("member");
        if (memberUser != null && !await eventsContext.CategorySuggestions.AnyAsync())
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

            eventsContext.CategorySuggestions.AddRange(suggestions);
            await eventsContext.SaveChangesAsync();
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

        eventsContext.Events.AddRange(events);
        await eventsContext.SaveChangesAsync();
    }
}
