using FluentAssertions;
using ProductCatalog.Api.DTOs;
using ProductCatalog.Api.Validation;
using Xunit;

namespace ProductCatalog.Tests;

public class ValidatorTests
{
    [Fact]
    public void ProductValidator_ValidProduct_ReturnsSuccess()
    {
        // Arrange
        var dto = new CreateProductDto(
            Name: "Valid Product",
            Description: "A valid product description",
            SKU: "VAL-001",
            Price: 99.99m,
            Quantity: 10,
            CategoryId: 1
        );

        // Act
        var result = ProductValidator.Validate(dto);

        // Assert
        result.Should().BeOfType<ValidationResult.Success>();
    }

    [Fact]
    public void ProductValidator_EmptyName_ReturnsFailure()
    {
        // Arrange
        var dto = new CreateProductDto(
            Name: "",
            Description: "Description",
            SKU: "SKU-001",
            Price: 10.00m,
            Quantity: 5,
            CategoryId: null
        );

        // Act
        var result = ProductValidator.Validate(dto);

        // Assert
        result.Should().BeOfType<ValidationResult.Failure>();
        var failure = result as ValidationResult.Failure;
        failure!.Errors.Should().Contain(e => e.Contains("Name is required"));
    }

    [Fact]
    public void ProductValidator_NameTooLong_ReturnsFailure()
    {
        // Arrange
        var dto = new CreateProductDto(
            Name: new string('A', 201), // 201 characters
            Description: "Description",
            SKU: "SKU-001",
            Price: 10.00m,
            Quantity: 5,
            CategoryId: null
        );

        // Act
        var result = ProductValidator.Validate(dto);

        // Assert
        result.Should().BeOfType<ValidationResult.Failure>();
        var failure = result as ValidationResult.Failure;
        failure!.Errors.Should().Contain(e => e.Contains("200 characters"));
    }

    [Fact]
    public void ProductValidator_EmptySku_ReturnsFailure()
    {
        // Arrange
        var dto = new CreateProductDto(
            Name: "Valid Name",
            Description: "Description",
            SKU: "",
            Price: 10.00m,
            Quantity: 5,
            CategoryId: null
        );

        // Act
        var result = ProductValidator.Validate(dto);

        // Assert
        result.Should().BeOfType<ValidationResult.Failure>();
        var failure = result as ValidationResult.Failure;
        failure!.Errors.Should().Contain(e => e.Contains("SKU is required"));
    }

    [Fact]
    public void ProductValidator_NegativePrice_ReturnsFailure()
    {
        // Arrange
        var dto = new CreateProductDto(
            Name: "Valid Name",
            Description: "Description",
            SKU: "SKU-001",
            Price: -10.00m,
            Quantity: 5,
            CategoryId: null
        );

        // Act
        var result = ProductValidator.Validate(dto);

        // Assert
        result.Should().BeOfType<ValidationResult.Failure>();
        var failure = result as ValidationResult.Failure;
        failure!.Errors.Should().Contain(e => e.Contains("Price cannot be negative"));
    }

    [Fact]
    public void ProductValidator_NegativeQuantity_ReturnsFailure()
    {
        // Arrange
        var dto = new CreateProductDto(
            Name: "Valid Name",
            Description: "Description",
            SKU: "SKU-001",
            Price: 10.00m,
            Quantity: -5,
            CategoryId: null
        );

        // Act
        var result = ProductValidator.Validate(dto);

        // Assert
        result.Should().BeOfType<ValidationResult.Failure>();
        var failure = result as ValidationResult.Failure;
        failure!.Errors.Should().Contain(e => e.Contains("Quantity cannot be negative"));
    }

    [Fact]
    public void ProductValidator_MultipleErrors_ReturnsAllErrors()
    {
        // Arrange
        var dto = new CreateProductDto(
            Name: "",
            Description: null,
            SKU: "",
            Price: -10.00m,
            Quantity: -5,
            CategoryId: null
        );

        // Act
        var result = ProductValidator.Validate(dto);

        // Assert
        result.Should().BeOfType<ValidationResult.Failure>();
        var failure = result as ValidationResult.Failure;
        failure!.Errors.Should().HaveCountGreaterOrEqualTo(4);
    }

    [Fact]
    public void CategoryValidator_ValidCategory_ReturnsSuccess()
    {
        // Arrange
        var dto = new CreateCategoryDto(
            Name: "Valid Category",
            Description: "A valid category description",
            ParentCategoryId: null
        );

        // Act
        var result = CategoryValidator.Validate(dto);

        // Assert
        result.Should().BeOfType<ValidationResult.Success>();
    }

    [Fact]
    public void CategoryValidator_EmptyName_ReturnsFailure()
    {
        // Arrange
        var dto = new CreateCategoryDto(
            Name: "",
            Description: "Description",
            ParentCategoryId: null
        );

        // Act
        var result = CategoryValidator.Validate(dto);

        // Assert
        result.Should().BeOfType<ValidationResult.Failure>();
        var failure = result as ValidationResult.Failure;
        failure!.Errors.Should().Contain(e => e.Contains("Name is required"));
    }

    [Fact]
    public void CategoryValidator_NameTooLong_ReturnsFailure()
    {
        // Arrange
        var dto = new CreateCategoryDto(
            Name: new string('A', 101), // 101 characters
            Description: "Description",
            ParentCategoryId: null
        );

        // Act
        var result = CategoryValidator.Validate(dto);

        // Assert
        result.Should().BeOfType<ValidationResult.Failure>();
        var failure = result as ValidationResult.Failure;
        failure!.Errors.Should().Contain(e => e.Contains("100 characters"));
    }
}
