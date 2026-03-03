using ProductCatalog.Api.Models;

namespace ProductCatalog.Api.Data;

public static class DbSeeder
{
    public static void Seed(ProductCatalogDbContext context)
    {
        if (context.Categories.Any()) return;

        // Create categories
        var electronics = new Category { Id = 1, Name = "Electronics", Description = "Electronic devices and accessories" };
        var computers = new Category { Id = 2, Name = "Computers", Description = "Desktop and laptop computers", ParentCategoryId = 1 };
        var phones = new Category { Id = 3, Name = "Phones", Description = "Mobile phones and smartphones", ParentCategoryId = 1 };
        var clothing = new Category { Id = 4, Name = "Clothing", Description = "Apparel and fashion items" };
        var menClothing = new Category { Id = 5, Name = "Men's Clothing", Description = "Clothing for men", ParentCategoryId = 4 };
        var womenClothing = new Category { Id = 6, Name = "Women's Clothing", Description = "Clothing for women", ParentCategoryId = 4 };
        var homeGarden = new Category { Id = 7, Name = "Home & Garden", Description = "Home improvement and garden supplies" };

        context.Categories.AddRange(electronics, computers, phones, clothing, menClothing, womenClothing, homeGarden);

        // Create products
        var products = new List<Product>
        {
            new() { Id = 1, Name = "Laptop Pro 15", Description = "High-performance laptop with 15-inch display", SKU = "LAP-001", Price = 1299.99m, Quantity = 50, CategoryId = 2, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = 2, Name = "Gaming Desktop", Description = "Powerful gaming computer with RGB lighting", SKU = "DSK-001", Price = 1899.99m, Quantity = 25, CategoryId = 2, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = 3, Name = "Smartphone X12", Description = "Latest smartphone with advanced camera", SKU = "PHN-001", Price = 899.99m, Quantity = 100, CategoryId = 3, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = 4, Name = "Wireless Earbuds", Description = "Premium wireless earbuds with noise cancellation", SKU = "EAR-001", Price = 199.99m, Quantity = 200, CategoryId = 1, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = 5, Name = "Men's Casual Shirt", Description = "Comfortable cotton casual shirt", SKU = "MCS-001", Price = 49.99m, Quantity = 150, CategoryId = 5, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = 6, Name = "Women's Summer Dress", Description = "Elegant summer dress", SKU = "WSD-001", Price = 79.99m, Quantity = 75, CategoryId = 6, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = 7, Name = "Garden Tool Set", Description = "Complete set of essential garden tools", SKU = "GTS-001", Price = 89.99m, Quantity = 40, CategoryId = 7, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = 8, Name = "Smart Watch Pro", Description = "Advanced smartwatch with health monitoring", SKU = "SWP-001", Price = 349.99m, Quantity = 80, CategoryId = 1, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = 9, Name = "Tablet Ultra", Description = "10-inch tablet perfect for work and entertainment", SKU = "TAB-001", Price = 599.99m, Quantity = 60, CategoryId = 1, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = 10, Name = "Men's Jeans Classic", Description = "Classic fit denim jeans", SKU = "MJC-001", Price = 69.99m, Quantity = 120, CategoryId = 5, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        };

        context.Products.AddRange(products);
        context.SaveChanges();
    }
}
