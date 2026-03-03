using FluentAssertions;
using ProductCatalog.Api.Services;
using Xunit;

namespace ProductCatalog.Tests;

public class SearchCacheServiceTests
{
    private readonly SearchCacheService _cacheService;

    public SearchCacheServiceTests()
    {
        _cacheService = new SearchCacheService();
    }

    [Fact]
    public void CacheResults_AndRetrieve_ReturnsCorrectData()
    {
        // Arrange
        var testData = new List<string> { "item1", "item2", "item3" };
        var cacheKey = "test-key";

        // Act
        _cacheService.CacheResults(cacheKey, testData);
        var success = _cacheService.TryGetCachedResults<string>(cacheKey, out var results);

        // Assert
        success.Should().BeTrue();
        results.Should().NotBeNull();
        results.Should().BeEquivalentTo(testData);
    }

    [Fact]
    public void TryGetCachedResults_NonExistentKey_ReturnsFalse()
    {
        // Act
        var success = _cacheService.TryGetCachedResults<string>("non-existent-key", out var results);

        // Assert
        success.Should().BeFalse();
        results.Should().BeNull();
    }

    [Fact]
    public void InvalidateCache_RemovesAllEntries()
    {
        // Arrange
        _cacheService.CacheResults("key1", new List<string> { "a", "b" });
        _cacheService.CacheResults("key2", new List<string> { "c", "d" });

        // Act
        _cacheService.InvalidateCache();

        // Assert
        _cacheService.TryGetCachedResults<string>("key1", out _).Should().BeFalse();
        _cacheService.TryGetCachedResults<string>("key2", out _).Should().BeFalse();
    }

    [Fact]
    public void InvalidateCache_WithPrefix_RemovesOnlyMatchingEntries()
    {
        // Arrange
        _cacheService.CacheResults("products:search:test", new List<string> { "a" });
        _cacheService.CacheResults("products:filter:category", new List<string> { "b" });
        _cacheService.CacheResults("categories:all", new List<string> { "c" });

        // Act
        _cacheService.InvalidateCache("products");

        // Assert
        _cacheService.TryGetCachedResults<string>("products:search:test", out _).Should().BeFalse();
        _cacheService.TryGetCachedResults<string>("products:filter:category", out _).Should().BeFalse();
        _cacheService.TryGetCachedResults<string>("categories:all", out _).Should().BeTrue();
    }

    [Fact]
    public void CacheResults_WithComplexType_WorksCorrectly()
    {
        // Arrange
        var testData = new List<TestProduct>
        {
            new(1, "Product 1", 99.99m),
            new(2, "Product 2", 49.99m)
        };
        var cacheKey = "complex-type-key";

        // Act
        _cacheService.CacheResults(cacheKey, testData);
        var success = _cacheService.TryGetCachedResults<TestProduct>(cacheKey, out var results);

        // Assert
        success.Should().BeTrue();
        results.Should().NotBeNull();
        results!.ToList().Should().HaveCount(2);
    }

    [Fact]
    public void CacheResults_OverwritesExistingEntry()
    {
        // Arrange
        var cacheKey = "overwrite-key";
        _cacheService.CacheResults(cacheKey, new List<string> { "original" });

        // Act
        _cacheService.CacheResults(cacheKey, new List<string> { "updated" });
        _cacheService.TryGetCachedResults<string>(cacheKey, out var results);

        // Assert
        results.Should().NotBeNull();
        results!.Single().Should().Be("updated");
    }

    private record TestProduct(int Id, string Name, decimal Price);
}
