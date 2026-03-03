using Microsoft.EntityFrameworkCore;
using ProductCatalog.Api.Data;
using ProductCatalog.Api.DTOs;
using ProductCatalog.Api.Extensions;
using ProductCatalog.Api.Models;

namespace ProductCatalog.Api.Repositories;

/// <summary>
/// Product repository implementation using Entity Framework Core
/// </summary>
public class ProductRepository : Repository<Product>, IProductRepository
{
    public ProductRepository(ProductCatalogDbContext context) : base(context)
    {
    }

    public override async Task<Product?> GetByIdAsync(int id)
    {
        return await _dbSet
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Product?> GetByIdWithCategoryAsync(int id)
    {
        return await _dbSet
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<PaginatedResult<Product>> GetPaginatedAsync(ProductSearchParams searchParams)
    {
        var query = _dbSet.Include(p => p.Category).AsQueryable();

        // Apply custom LINQ extension methods for filtering
        query = query.FilterBySearchTerm(searchParams.SearchTerm)
                     .FilterByCategory(searchParams.CategoryId);

        var totalCount = await query.CountAsync();

        // Apply sorting using custom extension
        query = query.ApplySorting(searchParams.SortBy, searchParams.SortDescending);

        // Apply pagination
        var items = await query
            .Skip((searchParams.Page - 1) * searchParams.PageSize)
            .Take(searchParams.PageSize)
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)searchParams.PageSize);

        return new PaginatedResult<Product>(items, totalCount, searchParams.Page, searchParams.PageSize, totalPages);
    }

    public async Task<IEnumerable<Product>> GetByCategoryAsync(int categoryId)
    {
        return await _dbSet
            .Include(p => p.Category)
            .Where(p => p.CategoryId == categoryId)
            .ToListAsync();
    }

    public async Task<bool> SkuExistsAsync(string sku, int? excludeId = null)
    {
        return await _dbSet.AnyAsync(p => p.SKU == sku && (excludeId == null || p.Id != excludeId));
    }
}
