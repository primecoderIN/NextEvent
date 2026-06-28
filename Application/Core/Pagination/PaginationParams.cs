namespace Application.Core.Pagination;

/// <summary>
/// Standardizes pagination parameters for API requests.
/// Inherit this class in MediatR queries to automatically support pagination.
/// </summary>
public class PaginationParams
{
    // Hard limit to prevent massive database reads if a user maliciously requests a huge page size.
    private const int MaxPageSize = 50;
    
    /// <summary>
    /// The current page number being requested. Defaults to 1.
    /// </summary>
    public int PageNumber { get; set; } = 1;

    private int _pageSize = 10;
    
    /// <summary>
    /// The number of items to return per page. Defaults to 10, capped at MaxPageSize (50).
    /// </summary>
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
    }
}
