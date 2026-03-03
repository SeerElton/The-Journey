using ProductCatalog.Api.Models;

namespace ProductCatalog.Api.Extensions;

/// <summary>
/// Custom LINQ extension methods for product filtering
/// </summary>
public static class ProductQueryExtensions
{
    /// <summary>
    /// Filter products by search term (searches in Name, Description, SKU)
    /// </summary>
    public static IQueryable<Product> FilterBySearchTerm(this IQueryable<Product> query, string? searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return query;
        }

        var term = searchTerm.ToLower().Trim();
        return query.Where(p =>
            p.Name.ToLower().Contains(term) ||
            (p.Description != null && p.Description.ToLower().Contains(term)) ||
            p.SKU.ToLower().Contains(term)
        );
    }

    /// <summary>
    /// Filter products by category ID
    /// </summary>
    public static IQueryable<Product> FilterByCategory(this IQueryable<Product> query, int? categoryId)
    {
        if (!categoryId.HasValue)
        {
            return query;
        }

        return query.Where(p => p.CategoryId == categoryId);
    }

    /// <summary>
    /// Filter products by price range
    /// </summary>
    public static IQueryable<Product> FilterByPriceRange(this IQueryable<Product> query, decimal? minPrice, decimal? maxPrice)
    {
        if (minPrice.HasValue)
        {
            query = query.Where(p => p.Price >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= maxPrice.Value);
        }

        return query;
    }

    /// <summary>
    /// Filter products that are in stock
    /// </summary>
    public static IQueryable<Product> FilterInStock(this IQueryable<Product> query, bool? inStockOnly)
    {
        if (inStockOnly == true)
        {
            return query.Where(p => p.Quantity > 0);
        }

        return query;
    }

    /// <summary>
    /// Apply sorting to products using custom IComparable or specified field
    /// </summary>
    public static IQueryable<Product> ApplySorting(this IQueryable<Product> query, string? sortBy, bool descending = false)
    {
        // Default sort uses IComparable (Name, then Price)
        if (string.IsNullOrEmpty(sortBy))
        {
            return descending
                ? query.OrderByDescending(p => p.Name).ThenByDescending(p => p.Price)
                : query.OrderBy(p => p.Name).ThenBy(p => p.Price);
        }

        // Pattern matching for sort field selection
        return sortBy.ToLower() switch
        {
            "name" => descending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            "price" => descending ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price),
            "quantity" => descending ? query.OrderByDescending(p => p.Quantity) : query.OrderBy(p => p.Quantity),
            "sku" => descending ? query.OrderByDescending(p => p.SKU) : query.OrderBy(p => p.SKU),
            "createdat" => descending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt),
            "updatedat" => descending ? query.OrderByDescending(p => p.UpdatedAt) : query.OrderBy(p => p.UpdatedAt),
            _ => query.OrderBy(p => p.Name)
        };
    }

    /// <summary>
    /// Convert products to a list sorted using IComparable
    /// </summary>
    public static List<Product> ToSortedList(this IEnumerable<Product> products)
    {
        var list = products.ToList();
        list.Sort(); // Uses IComparable<Product>
        return list;
    }
}
