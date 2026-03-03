using ProductCatalog.Api.Models;
using ProductCatalog.Api.DTOs;

namespace ProductCatalog.Api.Repositories;

/// <summary>
/// Category repository using pure in-memory collections (List, Dictionary)
/// as specified in requirements - NO Entity Framework
/// </summary>
public class CategoryRepository : ICategoryRepository
{
    // In-memory storage using Dictionary for O(1) lookups
    private readonly Dictionary<int, Category> _categories = new();
    private int _nextId = 1;
    private readonly object _lock = new();

    public CategoryRepository()
    {
        // Initialize with seed data
        SeedData();
    }

    private void SeedData()
    {
        var electronics = new Category { Id = _nextId++, Name = "Electronics", Description = "Electronic devices and accessories" };
        var computers = new Category { Id = _nextId++, Name = "Computers", Description = "Desktop and laptop computers", ParentCategoryId = electronics.Id };
        var phones = new Category { Id = _nextId++, Name = "Phones", Description = "Mobile phones and smartphones", ParentCategoryId = electronics.Id };
        var clothing = new Category { Id = _nextId++, Name = "Clothing", Description = "Apparel and fashion items" };
        var menClothing = new Category { Id = _nextId++, Name = "Men's Clothing", Description = "Clothing for men", ParentCategoryId = clothing.Id };
        var womenClothing = new Category { Id = _nextId++, Name = "Women's Clothing", Description = "Clothing for women", ParentCategoryId = clothing.Id };
        var homeGarden = new Category { Id = _nextId++, Name = "Home & Garden", Description = "Home improvement and garden supplies" };

        _categories[electronics.Id] = electronics;
        _categories[computers.Id] = computers;
        _categories[phones.Id] = phones;
        _categories[clothing.Id] = clothing;
        _categories[menClothing.Id] = menClothing;
        _categories[womenClothing.Id] = womenClothing;
        _categories[homeGarden.Id] = homeGarden;
    }

    public Task<Category?> GetByIdAsync(int id)
    {
        _categories.TryGetValue(id, out var category);
        return Task.FromResult(category);
    }

    public Task<IEnumerable<Category>> GetAllAsync()
    {
        return Task.FromResult<IEnumerable<Category>>(_categories.Values.ToList());
    }

    public Task<IEnumerable<Category>> GetAllWithParentAsync()
    {
        // Set parent category references
        var categories = _categories.Values.ToList();
        foreach (var category in categories)
        {
            if (category.ParentCategoryId.HasValue && _categories.TryGetValue(category.ParentCategoryId.Value, out var parent))
            {
                category.ParentCategory = parent;
            }
        }
        return Task.FromResult<IEnumerable<Category>>(categories);
    }

    public Task<IEnumerable<Category>> FindAsync(System.Linq.Expressions.Expression<Func<Category, bool>> predicate)
    {
        var compiled = predicate.Compile();
        var result = _categories.Values.Where(compiled).ToList();
        return Task.FromResult<IEnumerable<Category>>(result);
    }

    public Task<Category> AddAsync(Category entity)
    {
        lock (_lock)
        {
            entity.Id = _nextId++;
            _categories[entity.Id] = entity;
        }
        return Task.FromResult(entity);
    }

    public Task UpdateAsync(Category entity)
    {
        lock (_lock)
        {
            if (_categories.ContainsKey(entity.Id))
            {
                _categories[entity.Id] = entity;
            }
        }
        return Task.CompletedTask;
    }

    public Task DeleteAsync(int id)
    {
        lock (_lock)
        {
            _categories.Remove(id);
        }
        return Task.CompletedTask;
    }

    public Task<int> CountAsync(System.Linq.Expressions.Expression<Func<Category, bool>>? predicate = null)
    {
        if (predicate == null)
        {
            return Task.FromResult(_categories.Count);
        }
        var compiled = predicate.Compile();
        return Task.FromResult(_categories.Values.Count(compiled));
    }

    public Task<IEnumerable<CategoryTreeDto>> GetCategoryTreeAsync()
    {
        var rootCategories = _categories.Values
            .Where(c => c.ParentCategoryId == null)
            .Select(c => BuildCategoryTree(c))
            .ToList();

        return Task.FromResult<IEnumerable<CategoryTreeDto>>(rootCategories);
    }

    private CategoryTreeDto BuildCategoryTree(Category category)
    {
        var children = _categories.Values
            .Where(c => c.ParentCategoryId == category.Id)
            .Select(c => BuildCategoryTree(c))
            .ToList();

        return new CategoryTreeDto(category.Id, category.Name, category.Description, children);
    }

    public Task<bool> HasChildrenAsync(int categoryId)
    {
        var hasChildren = _categories.Values.Any(c => c.ParentCategoryId == categoryId);
        return Task.FromResult(hasChildren);
    }

    public Task<bool> HasProductsAsync(int categoryId)
    {
        // This would need to check with ProductRepository
        // For now, return false (can be enhanced with proper DI)
        return Task.FromResult(false);
    }
}
