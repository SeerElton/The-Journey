namespace ProductCatalog.Api.DTOs;

/// <summary>
/// Record type (C# 9+) for Product response DTO
/// </summary>
public record ProductDto(
    int Id,
    string Name,
    string? Description,
    string SKU,
    decimal Price,
    int Quantity,
    int? CategoryId,
    string? CategoryName,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

/// <summary>
/// Record type for creating a product
/// </summary>
public record CreateProductDto(
    string Name,
    string? Description,
    string SKU,
    decimal Price,
    int Quantity,
    int? CategoryId
);

/// <summary>
/// Record type for updating a product
/// </summary>
public record UpdateProductDto(
    string Name,
    string? Description,
    string SKU,
    decimal Price,
    int Quantity,
    int? CategoryId
);

/// <summary>
/// Record type for product search parameters
/// </summary>
public record ProductSearchParams(
    string? SearchTerm,
    int? CategoryId,
    int Page = 1,
    int PageSize = 10,
    string? SortBy = null,
    bool SortDescending = false
);

/// <summary>
/// Record type for paginated response
/// </summary>
public record PaginatedResult<T>(
    IEnumerable<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);
