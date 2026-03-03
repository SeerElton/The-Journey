using FluentAssertions;
using ProductCatalog.Api.Services;
using Xunit;

namespace ProductCatalog.Tests;

public class ProductSearchEngineTests
{
    private readonly ProductSearchEngine _searchEngine;

    public ProductSearchEngineTests()
    {
        _searchEngine = new ProductSearchEngine();
    }

    private record TestItem(int Id, string Name, string? Description, string Sku);

    private Dictionary<string, string?> ExtractFields(TestItem item) => new()
    {
        { "Name", item.Name },
        { "Description", item.Description },
        { "SKU", item.Sku }
    };

    [Fact]
    public void Search_WithEmptySearchTerm_ReturnsAllItems()
    {
        // Arrange
        var items = new List<TestItem>
        {
            new(1, "Laptop Pro", "High-performance laptop", "LAP-001"),
            new(2, "Desktop Computer", "Desktop workstation", "DSK-001"),
            new(3, "Tablet Device", "Portable tablet", "TAB-001")
        };

        // Act
        var results = _searchEngine.Search(items, "", ExtractFields).ToList();

        // Assert
        results.Should().HaveCount(3);
    }

    [Fact]
    public void Search_WithExactMatch_ReturnsHighestScore()
    {
        // Arrange
        var items = new List<TestItem>
        {
            new(1, "Laptop", "A laptop computer", "LAP-001"),
            new(2, "Laptop Pro", "Professional laptop", "LAP-002"),
            new(3, "Desktop", "Desktop computer", "DSK-001")
        };

        // Act
        var results = _searchEngine.Search(items, "laptop", ExtractFields).ToList();

        // Assert
        results.Should().NotBeEmpty();
        results.First().Item.Name.Should().Be("Laptop");
        results.Should().HaveCountGreaterThan(1);
    }

    [Fact]
    public void Search_WithContainsMatch_ReturnsMatchingItems()
    {
        // Arrange
        var items = new List<TestItem>
        {
            new(1, "Gaming Laptop Pro", "High-end gaming laptop", "GAM-001"),
            new(2, "Desktop Computer", "Standard desktop", "DSK-001"),
            new(3, "Tablet Ultra", "Premium tablet", "TAB-001")
        };

        // Act
        var results = _searchEngine.Search(items, "laptop", ExtractFields).ToList();

        // Assert
        results.Should().HaveCount(1);
        results.First().Item.Id.Should().Be(1);
    }

    [Fact]
    public void Search_WithFuzzyMatch_FindsTypos()
    {
        // Arrange
        var items = new List<TestItem>
        {
            new(1, "Laptop Pro", "Professional laptop", "LAP-001"),
            new(2, "Desktop", "Desktop computer", "DSK-001")
        };

        // Act - "lptop" is a typo for "laptop"
        var results = _searchEngine.Search(items, "lptop", ExtractFields).ToList();

        // Assert
        results.Should().NotBeEmpty();
        results.First().Item.Name.Should().Contain("Laptop");
    }

    [Fact]
    public void Search_WithFuzzyMatch_FindsMissingCharacter()
    {
        // Arrange
        var items = new List<TestItem>
        {
            new(1, "Computer", "Desktop computer", "COM-001"),
            new(2, "Monitor", "Display monitor", "MON-001")
        };

        // Act - "compter" is missing 'u'
        var results = _searchEngine.Search(items, "compter", ExtractFields).ToList();

        // Assert
        results.Should().NotBeEmpty();
        results.First().Item.Name.Should().Be("Computer");
    }

    [Fact]
    public void Search_ByDescription_FindsMatches()
    {
        // Arrange
        var items = new List<TestItem>
        {
            new(1, "Product A", "This is a wireless mouse", "PRD-001"),
            new(2, "Product B", "This is a wired keyboard", "PRD-002")
        };

        // Act
        var results = _searchEngine.Search(items, "wireless", ExtractFields).ToList();

        // Assert
        results.Should().HaveCount(1);
        results.First().Item.Id.Should().Be(1);
    }

    [Fact]
    public void Search_BySku_FindsMatches()
    {
        // Arrange
        var items = new List<TestItem>
        {
            new(1, "Product A", "Description A", "ABC-123"),
            new(2, "Product B", "Description B", "XYZ-789")
        };

        // Act
        var results = _searchEngine.Search(items, "ABC-123", ExtractFields).ToList();

        // Assert
        results.Should().HaveCount(1);
        results.First().Item.Sku.Should().Be("ABC-123");
    }

    [Fact]
    public void Search_ResultsAreSortedByScore()
    {
        // Arrange
        var items = new List<TestItem>
        {
            new(1, "The Phone Case", "Case for phone", "PHN-001"),
            new(2, "Phone", "Mobile phone device", "PHN-002"),
            new(3, "Phone Pro Max", "Premium phone", "PHN-003")
        };

        // Act
        var results = _searchEngine.Search(items, "phone", ExtractFields).ToList();

        // Assert
        results.Should().NotBeEmpty();
        // Exact match should be first
        results.First().Item.Name.Should().Be("Phone");
        // Scores should be in descending order
        for (int i = 0; i < results.Count - 1; i++)
        {
            results[i].Score.Should().BeGreaterThanOrEqualTo(results[i + 1].Score);
        }
    }

    [Fact]
    public void Search_WithNoMatches_ReturnsEmpty()
    {
        // Arrange
        var items = new List<TestItem>
        {
            new(1, "Laptop", "A laptop", "LAP-001"),
            new(2, "Desktop", "A desktop", "DSK-001")
        };

        // Act
        var results = _searchEngine.Search(items, "xyz123nonexistent", ExtractFields).ToList();

        // Assert
        results.Should().BeEmpty();
    }

    [Fact]
    public void Search_CaseInsensitive()
    {
        // Arrange
        var items = new List<TestItem>
        {
            new(1, "LAPTOP PRO", "Professional LAPTOP", "LAP-001")
        };

        // Act
        var results = _searchEngine.Search(items, "laptop", ExtractFields).ToList();

        // Assert
        results.Should().HaveCount(1);
    }

    [Fact]
    public void Search_WithWhitespace_TrimsSearchTerm()
    {
        // Arrange
        var items = new List<TestItem>
        {
            new(1, "Laptop", "A laptop", "LAP-001")
        };

        // Act
        var results = _searchEngine.Search(items, "  laptop  ", ExtractFields).ToList();

        // Assert
        results.Should().HaveCount(1);
    }
}
