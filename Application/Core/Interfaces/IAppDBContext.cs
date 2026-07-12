using Domain;
using Microsoft.EntityFrameworkCore;

namespace Application.Core.Interfaces;

/// <summary>
/// Interface for the application database context. 
/// Used to achieve Dependency Inversion so the Application layer 
/// does not directly depend on the Persistence infrastructure.
/// </summary>
public interface IAppDBContext
{
    /// <summary>
    /// Gets or sets the Events dataset.
    /// </summary>
    DbSet<Event> Events { get; set; }

    /// <summary>
    /// Gets or sets the Categories dataset.
    /// </summary>
    DbSet<Category> Categories { get; set; }

    /// <summary>
    /// Gets or sets the CategorySuggestions dataset.
    /// </summary>
    DbSet<CategorySuggestion> CategorySuggestions { get; set; }

    /// <summary>
    /// Gets or sets the Organizations dataset.
    /// </summary>
    DbSet<Organization> Organizations { get; set; }

    /// <summary>
    /// Saves all changes made in this context to the underlying database.
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
