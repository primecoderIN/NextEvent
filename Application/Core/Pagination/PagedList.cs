namespace Application.Core.Pagination;

/// <summary>
/// A generic wrapper that encapsulates a paginated subset of data along with its metadata.
/// </summary>
/// <typeparam name="T">The type of items being paginated.</typeparam>
public class PagedList<T>
{
    public PagedList(List<T> items, int count, int pageNumber, int pageSize)
    {
        CurrentPage = pageNumber;
        // Calculate the total number of pages based on the total count and page size.
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        PageSize = pageSize;
        TotalCount = count;
        Items = items;
    }

    /// <summary>The actual data items for the current page.</summary>
    public List<T> Items { get; set; }
    
    /// <summary>The current page number (1-indexed).</summary>
    public int CurrentPage { get; set; }
    
    /// <summary>The total number of pages available.</summary>
    public int TotalPages { get; set; }
    
    /// <summary>The number of items requested per page.</summary>
    public int PageSize { get; set; }
    
    /// <summary>The absolute total number of items in the database.</summary>
    public int TotalCount { get; set; }
}
