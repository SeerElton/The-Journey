using ProductCatalog.Api.DTOs;

namespace ProductCatalog.Api.Validation;

/// <summary>
/// Validation result using pattern matching
/// </summary>
public abstract record ValidationResult
{
    public record Success : ValidationResult;
    public record Failure(string[] Errors) : ValidationResult;
}

/// <summary>
/// Validator for product DTOs using pattern matching
/// </summary>
public static class ProductValidator
{
    public static ValidationResult Validate(CreateProductDto dto)
    {
        var errors = new List<string>();

        // Pattern matching for validation rules
        if (dto is { Name: null or "" })
            errors.Add("Name is required");
        else if (dto is { Name.Length: > 200 })
            errors.Add("Name cannot exceed 200 characters");

        if (dto is { SKU: null or "" })
            errors.Add("SKU is required");
        else if (dto is { SKU.Length: > 50 })
            errors.Add("SKU cannot exceed 50 characters");

        if (dto is { Price: < 0 })
            errors.Add("Price cannot be negative");

        if (dto is { Quantity: < 0 })
            errors.Add("Quantity cannot be negative");

        return errors.Count > 0
            ? new ValidationResult.Failure(errors.ToArray())
            : new ValidationResult.Success();
    }

    public static ValidationResult Validate(UpdateProductDto dto)
    {
        var errors = new List<string>();

        if (dto is { Name: null or "" })
            errors.Add("Name is required");
        else if (dto is { Name.Length: > 200 })
            errors.Add("Name cannot exceed 200 characters");

        if (dto is { SKU: null or "" })
            errors.Add("SKU is required");
        else if (dto is { SKU.Length: > 50 })
            errors.Add("SKU cannot exceed 50 characters");

        if (dto is { Price: < 0 })
            errors.Add("Price cannot be negative");

        if (dto is { Quantity: < 0 })
            errors.Add("Quantity cannot be negative");

        return errors.Count > 0
            ? new ValidationResult.Failure(errors.ToArray())
            : new ValidationResult.Success();
    }
}

/// <summary>
/// Validator for category DTOs using pattern matching
/// </summary>
public static class CategoryValidator
{
    public static ValidationResult Validate(CreateCategoryDto dto)
    {
        var errors = new List<string>();

        if (dto is { Name: null or "" })
            errors.Add("Name is required");
        else if (dto is { Name.Length: > 100 })
            errors.Add("Name cannot exceed 100 characters");

        return errors.Count > 0
            ? new ValidationResult.Failure(errors.ToArray())
            : new ValidationResult.Success();
    }
}
