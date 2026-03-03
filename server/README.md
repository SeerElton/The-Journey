# Product Catalog API

ASP.NET Core 8 Web API for the Product Catalog Management System.

## Features

- RESTful API for products and categories
- Generic Repository pattern
- Custom fuzzy search engine (no external dependencies)
- In-memory caching layer
- Custom middleware for logging and error handling
- Entity Framework Core with In-Memory database
- Pure in-memory Category repository using Dictionary

## Prerequisites

- .NET 8 SDK

## Getting Started

```bash
# Restore packages
dotnet restore

# Run the API
cd ProductCatalog.Api
dotnet run
```

The API will be available at `http://localhost:5000`

Swagger UI: `http://localhost:5000/swagger`

## Available Commands

| Command | Description |
|---------|-------------|
| `dotnet restore` | Restore NuGet packages |
| `dotnet build` | Build the solution |
| `dotnet run` | Run the API |
| `dotnet test` | Run unit tests |

## Project Structure

```
├── ProductCatalog.Api/
│   ├── Controllers/        # API endpoints
│   ├── Data/               # DbContext & seeder
│   ├── DTOs/               # Record type DTOs
│   ├── Extensions/         # LINQ extensions
│   ├── Middleware/         # Custom middleware
│   ├── Models/             # Entity models
│   ├── Repositories/       # Repository pattern
│   ├── Services/           # Business services
│   └── Validation/         # Validators
└── ProductCatalog.Tests/   # Unit tests
```

## Key Technologies

- ASP.NET Core 8
- Entity Framework Core (InMemory)
- C# 12 (Records, Pattern Matching, Nullable Refs)
- xUnit, FluentAssertions, Moq
