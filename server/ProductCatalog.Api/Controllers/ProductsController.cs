using Microsoft.AspNetCore.Mvc;
using ProductCatalog.Api.DTOs;
using ProductCatalog.Api.Models;
using ProductCatalog.Api.Repositories;
using ProductCatalog.Api.Services;
using ProductCatalog.Api.Validation;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ProductCatalog.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductRepository _productRepository;
    private readonly ProductSearchEngine _searchEngine;
    private readonly ISearchCacheService _cacheService;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(
        IProductRepository productRepository,
        ProductSearchEngine searchEngine,
        ISearchCacheService cacheService,
        ILogger<ProductsController> logger)
    {
        _productRepository = productRepository;
        _searchEngine = searchEngine;
        _cacheService = cacheService;
        _logger = logger;
    }

    /// <summary>
    /// GET /api/products - Get paginated products with filtering and search
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<ProductDto>>> GetProducts(
        [FromQuery] string? search,
        [FromQuery] int? categoryId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false)
    {
        var searchParams = new ProductSearchParams(search, categoryId, page, pageSize, sortBy, sortDescending);

        // Check cache first
        var cacheKey = $"products:{search}:{categoryId}:{page}:{pageSize}:{sortBy}:{sortDescending}";

        if (_cacheService.TryGetCachedResults<ProductDto>(cacheKey, out var cachedResults))
        {
            _logger.LogInformation("Cache hit for {CacheKey}", cacheKey);
            // For cached results, we'd need to also cache the pagination info
            // For simplicity, we skip caching for paginated results
        }

        var paginatedResult = await _productRepository.GetPaginatedAsync(searchParams);

        var productDtos = paginatedResult.Items.Select(MapToDto);

        var result = new PaginatedResult<ProductDto>(
            productDtos,
            paginatedResult.TotalCount,
            paginatedResult.Page,
            paginatedResult.PageSize,
            paginatedResult.TotalPages
        );

        return Ok(result);
    }

    /// <summary>
    /// GET /api/products/search - Advanced search with fuzzy matching
    /// Demonstrates custom JSON serialization
    /// </summary>
    [HttpGet("search")]
    public async Task<IActionResult> SearchProducts([FromQuery] string? q)
    {
        var products = await _productRepository.GetAllAsync();

        // Use ProductSearchEngine for fuzzy search
        var searchResults = _searchEngine.Search(
            products,
            q ?? "",
            product => new Dictionary<string, string?>
            {
                { "Name", product.Name },
                { "Description", product.Description },
                { "SKU", product.SKU }
            }
        );

        // Custom JSON serialization for this endpoint
        var response = searchResults.Select(r => new
        {
            Product = MapToDto(r.Item),
            SearchScore = Math.Round(r.Score, 2)
        });

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            WriteIndented = true
        };

        var json = JsonSerializer.Serialize(response, jsonOptions);
        return Content(json, "application/json");
    }

    /// <summary>
    /// GET /api/products/{id}
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var product = await _productRepository.GetByIdWithCategoryAsync(id);

        if (product is null)
        {
            return NotFound(new { Message = $"Product with ID {id} not found" });
        }

        return Ok(MapToDto(product));
    }

    /// <summary>
    /// POST /api/products
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto dto)
    {
        // Validate using pattern matching
        var validationResult = ProductValidator.Validate(dto);

        if (validationResult is ValidationResult.Failure failure)
        {
            return BadRequest(new { Errors = failure.Errors });
        }

        // Check for duplicate SKU
        if (await _productRepository.SkuExistsAsync(dto.SKU))
        {
            return BadRequest(new { Message = "A product with this SKU already exists" });
        }

        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            SKU = dto.SKU,
            Price = dto.Price,
            Quantity = dto.Quantity,
            CategoryId = dto.CategoryId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _productRepository.AddAsync(product);

        // Invalidate cache
        _cacheService.InvalidateCache("products");

        return CreatedAtAction(nameof(GetProduct), new { id = created.Id }, MapToDto(created));
    }

    /// <summary>
    /// PUT /api/products/{id}
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(int id, [FromBody] UpdateProductDto dto)
    {
        var validationResult = ProductValidator.Validate(dto);

        if (validationResult is ValidationResult.Failure failure)
        {
            return BadRequest(new { Errors = failure.Errors });
        }

        var product = await _productRepository.GetByIdAsync(id);

        if (product is null)
        {
            return NotFound(new { Message = $"Product with ID {id} not found" });
        }

        // Check for duplicate SKU (excluding current product)
        if (await _productRepository.SkuExistsAsync(dto.SKU, id))
        {
            return BadRequest(new { Message = "A product with this SKU already exists" });
        }

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.SKU = dto.SKU;
        product.Price = dto.Price;
        product.Quantity = dto.Quantity;
        product.CategoryId = dto.CategoryId;
        product.UpdatedAt = DateTime.UtcNow;

        await _productRepository.UpdateAsync(product);

        // Invalidate cache
        _cacheService.InvalidateCache("products");

        return Ok(MapToDto(product));
    }

    /// <summary>
    /// DELETE /api/products/{id}
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _productRepository.GetByIdAsync(id);

        if (product is null)
        {
            return NotFound(new { Message = $"Product with ID {id} not found" });
        }

        await _productRepository.DeleteAsync(id);

        // Invalidate cache
        _cacheService.InvalidateCache("products");

        return NoContent();
    }

    /// <summary>
    /// POST /api/products/manual-binding - Demonstrates manual model binding
    /// </summary>
    [HttpPost("manual-binding")]
    public async Task<ActionResult<ProductDto>> CreateProductManualBinding()
    {
        // Manual model binding - reading from request body manually
        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync();

        if (string.IsNullOrWhiteSpace(body))
        {
            return BadRequest(new { Message = "Request body is empty" });
        }

        try
        {
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            var dto = JsonSerializer.Deserialize<CreateProductDto>(body, jsonOptions);

            if (dto is null)
            {
                return BadRequest(new { Message = "Invalid JSON format" });
            }

            // Validate manually bound data
            var validationResult = ProductValidator.Validate(dto);

            if (validationResult is ValidationResult.Failure failure)
            {
                return BadRequest(new { Errors = failure.Errors });
            }

            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                SKU = dto.SKU,
                Price = dto.Price,
                Quantity = dto.Quantity,
                CategoryId = dto.CategoryId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var created = await _productRepository.AddAsync(product);

            _cacheService.InvalidateCache("products");

            return CreatedAtAction(nameof(GetProduct), new { id = created.Id }, MapToDto(created));
        }
        catch (JsonException ex)
        {
            return BadRequest(new { Message = $"Invalid JSON: {ex.Message}" });
        }
    }

    private static ProductDto MapToDto(Product product)
    {
        return new ProductDto(
            product.Id,
            product.Name,
            product.Description,
            product.SKU,
            product.Price,
            product.Quantity,
            product.CategoryId,
            product.Category?.Name,
            product.CreatedAt,
            product.UpdatedAt
        );
    }
}
