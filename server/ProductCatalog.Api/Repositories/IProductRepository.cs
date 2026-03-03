using ProductCatalog.Api.Models;
using ProductCatalog.Api.DTOs;

namespace ProductCatalog.Api.Repositories;

/// <summary>
/// Product-specific repository interface
/// </summary>
public interface IProductRepository : IRepository<Product>
{
    Task<Product?> GetByIdWithCategoryAsync(int id);
    Task<PaginatedResult<Product>> GetPaginatedAsync(ProductSearchParams searchParams);
    Task<IEnumerable<Product>> GetByCategoryAsync(int categoryId);
    Task<bool> SkuExistsAsync(string sku, int? excludeId = null);
}
