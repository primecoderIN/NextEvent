namespace NextEvent.Shared.Pagination;

/// <summary>
/// Standardizes pagination parameters for API requests.
/// Inherit this class in MediatR queries to automatically support pagination.
/// </summary>
public class PaginationParams
{
    // Hard limit to prevent massive database reads if a user maliciously requests a huge page size.
    private const int MaxPageSize = 50;

    private int _pageNumber = 1;

    /// <summary>
    /// The current page number being requested. Defaults to 1.
    /// Values below 1 are clamped to 1 to prevent a negative SQL OFFSET.
    /// </summary>
    public int PageNumber
    {
        get => _pageNumber;
        set => _pageNumber = value < 1 ? 1 : value;
    }

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
