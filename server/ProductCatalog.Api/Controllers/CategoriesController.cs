using Microsoft.AspNetCore.Mvc;
using ProductCatalog.Api.DTOs;
using ProductCatalog.Api.Models;
using ProductCatalog.Api.Repositories;
using ProductCatalog.Api.Validation;

namespace ProductCatalog.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(
        ICategoryRepository categoryRepository,
        ILogger<CategoriesController> logger)
    {
        _categoryRepository = categoryRepository;
        _logger = logger;
    }

    /// <summary>
    /// GET /api/categories - Returns flat list of all categories
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
    {
        var categories = await _categoryRepository.GetAllWithParentAsync();

        var categoryDtos = categories.Select(c => new CategoryDto(
            c.Id,
            c.Name,
            c.Description,
            c.ParentCategoryId,
            c.ParentCategory?.Name
        ));

        return Ok(categoryDtos);
    }

    /// <summary>
    /// GET /api/categories/tree - Returns hierarchical category tree structure
    /// </summary>
    [HttpGet("tree")]
    public async Task<ActionResult<IEnumerable<CategoryTreeDto>>> GetCategoryTree()
    {
        var tree = await _categoryRepository.GetCategoryTreeAsync();
        return Ok(tree);
    }

    /// <summary>
    /// GET /api/categories/{id}
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDto>> GetCategory(int id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);

        if (category is null)
        {
            return NotFound(new { Message = $"Category with ID {id} not found" });
        }

        var parent = category.ParentCategoryId.HasValue
            ? await _categoryRepository.GetByIdAsync(category.ParentCategoryId.Value)
            : null;

        return Ok(new CategoryDto(
            category.Id,
            category.Name,
            category.Description,
            category.ParentCategoryId,
            parent?.Name
        ));
    }

    /// <summary>
    /// POST /api/categories
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CreateCategoryDto dto)
    {
        // Validate using pattern matching
        var validationResult = CategoryValidator.Validate(dto);

        if (validationResult is ValidationResult.Failure failure)
        {
            return BadRequest(new { Errors = failure.Errors });
        }

        // Validate parent category exists if specified
        if (dto.ParentCategoryId.HasValue)
        {
            var parent = await _categoryRepository.GetByIdAsync(dto.ParentCategoryId.Value);
            if (parent is null)
            {
                return BadRequest(new { Message = $"Parent category with ID {dto.ParentCategoryId} not found" });
            }
        }

        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description,
            ParentCategoryId = dto.ParentCategoryId
        };

        var created = await _categoryRepository.AddAsync(category);

        return CreatedAtAction(nameof(GetCategory), new { id = created.Id }, new CategoryDto(
            created.Id,
            created.Name,
            created.Description,
            created.ParentCategoryId,
            null
        ));
    }

    /// <summary>
    /// PUT /api/categories/{id}
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<CategoryDto>> UpdateCategory(int id, [FromBody] UpdateCategoryDto dto)
    {
        var category = await _categoryRepository.GetByIdAsync(id);

        if (category is null)
        {
            return NotFound(new { Message = $"Category with ID {id} not found" });
        }

        // Prevent circular reference
        if (dto.ParentCategoryId == id)
        {
            return BadRequest(new { Message = "Category cannot be its own parent" });
        }

        // Validate parent category exists if specified
        string? parentName = null;
        if (dto.ParentCategoryId.HasValue)
        {
            var parent = await _categoryRepository.GetByIdAsync(dto.ParentCategoryId.Value);
            if (parent is null)
            {
                return BadRequest(new { Message = $"Parent category with ID {dto.ParentCategoryId} not found" });
            }
            parentName = parent.Name;
        }

        category.Name = dto.Name;
        category.Description = dto.Description;
        category.ParentCategoryId = dto.ParentCategoryId;

        await _categoryRepository.UpdateAsync(category);

        return Ok(new CategoryDto(
            category.Id,
            category.Name,
            category.Description,
            category.ParentCategoryId,
            parentName
        ));
    }

    /// <summary>
    /// DELETE /api/categories/{id}
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);

        if (category is null)
        {
            return NotFound(new { Message = $"Category with ID {id} not found" });
        }

        // Check if category has children
        if (await _categoryRepository.HasChildrenAsync(id))
        {
            return BadRequest(new { Message = "Cannot delete category with subcategories" });
        }

        await _categoryRepository.DeleteAsync(id);

        return NoContent();
    }
}
