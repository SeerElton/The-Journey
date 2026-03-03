namespace ProductCatalog.Api.Models;

/// <summary>
/// Product entity implementing IComparable for custom sorting
/// </summary>
public class Product : IComparable<Product>
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string SKU { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public int? CategoryId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation property
    public Category? Category { get; set; }

    /// <summary>
    /// Implements IComparable - sorts by Name, then by Price
    /// </summary>
    public int CompareTo(Product? other)
    {
        if (other is null) return 1;

        int nameComparison = string.Compare(Name, other.Name, StringComparison.OrdinalIgnoreCase);
        if (nameComparison != 0) return nameComparison;

        return Price.CompareTo(other.Price);
    }

    public override bool Equals(object? obj)
    {
        if (obj is Product other)
        {
            return Id == other.Id;
        }
        return false;
    }

    public override int GetHashCode() => Id.GetHashCode();
}
