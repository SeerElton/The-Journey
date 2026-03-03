namespace ProductCatalog.Api.DTOs;

/// <summary>
/// Record type for Category response DTO (flat)
/// </summary>
public record CategoryDto(
    int Id,
    string Name,
    string? Description,
    int? ParentCategoryId,
    string? ParentCategoryName
);

/// <summary>
/// Record type for hierarchical category tree
/// </summary>
public record CategoryTreeDto(
    int Id,
    string Name,
    string? Description,
    IEnumerable<CategoryTreeDto> Children
);

/// <summary>
/// Record type for creating a category
/// </summary>
public record CreateCategoryDto(
    string Name,
    string? Description,
    int? ParentCategoryId
);

/// <summary>
/// Record type for updating a category
/// </summary>
public record UpdateCategoryDto(
    string Name,
    string? Description,
    int? ParentCategoryId
);
