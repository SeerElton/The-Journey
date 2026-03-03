using ProductCatalog.Api.Models;
using ProductCatalog.Api.DTOs;

namespace ProductCatalog.Api.Repositories;

/// <summary>
/// Category-specific repository interface
/// </summary>
public interface ICategoryRepository : IRepository<Category>
{
    Task<IEnumerable<Category>> GetAllWithParentAsync();
    Task<IEnumerable<CategoryTreeDto>> GetCategoryTreeAsync();
    Task<bool> HasChildrenAsync(int categoryId);
    Task<bool> HasProductsAsync(int categoryId);
}
