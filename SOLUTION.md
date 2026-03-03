# Solution Design Document

## Overview

This document describes the design decisions, architecture, and trade-offs made while building the Product Catalog Management System.

## Architecture

### Backend Architecture

The backend follows a **Clean Architecture** approach with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     Controllers                              │
│  (HTTP endpoints, request/response handling)                 │
├─────────────────────────────────────────────────────────────┤
│                     Services                                 │
│  (Business logic, search engine, caching)                    │
├─────────────────────────────────────────────────────────────┤
│                     Repositories                             │
│  (Data access abstraction)                                   │
├─────────────────────────────────────────────────────────────┤
│                     Data Layer                               │
│  (EF Core InMemory / Pure In-Memory Collections)             │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

The Angular application uses a **component-based architecture** with:

- **Standalone Components**: Using Angular 18's standalone component model
- **Service Layer**: Centralized API communication with RxJS state management
- **Smart/Dumb Components**: Pages handle logic, shared components are presentational

## Key Design Decisions

### 1. Generic Repository Pattern

**Decision**: Implemented `Repository<T>` base class with generics.

```csharp
public abstract class Repository<T> : IRepository<T> where T : class
```

**Rationale**:
- Reduces code duplication across entities
- Provides consistent data access patterns
- Makes it easy to add new entities
- Enables unit testing with mock repositories

### 2. In-Memory Category Repository

**Decision**: CategoryRepository uses `Dictionary<int, Category>` instead of EF Core.

**Rationale**:
- Demonstrates pure C# data management skills
- Dictionary provides O(1) lookups by ID
- Thread-safe with proper locking
- Fulfills requirement for non-EF repository

**Trade-off**: No automatic change tracking or LINQ-to-SQL translation, but acceptable for small-medium datasets.

### 3. ProductSearchEngine with Fuzzy Matching

**Decision**: Built custom search engine using only BCL libraries.

**Implementation Details**:
- **Levenshtein Distance**: Implemented from scratch for fuzzy matching
- **Weighted Scoring**: Different weights for Name (3.0), SKU (2.0), Description (1.5)
- **Multi-strategy Matching**: Exact → Contains → Word-start → Fuzzy

**Algorithm**:
```
1. Check exact match (score: 10.0)
2. Check contains match (score: 7.0-9.0)
3. Check word-start match (score: 5.0)
4. Calculate Levenshtein distance for fuzzy matching (score: 1.0-4.0)
```

**Trade-offs**:
- ✅ Works without external dependencies
- ✅ Configurable field weights
- ⚠️ O(n) complexity for full-text search (acceptable for demo)
- ⚠️ Could use Trie or inverted index for better large-scale performance

### 4. Caching Layer with Dictionary

**Decision**: Simple in-memory cache using `Dictionary<string, CacheEntry>`.

**Features**:
- TTL-based expiration
- Prefix-based invalidation
- Thread-safe operations

**Trade-offs**:
- ✅ Simple, no external dependencies
- ✅ Fast lookups
- ⚠️ Not distributed (single server only)
- ⚠️ Memory pressure with large datasets

### 5. Record Types for DTOs

**Decision**: Used C# record types for all DTOs.

```csharp
public record ProductDto(int Id, string Name, decimal Price, ...);
```

**Benefits**:
- Immutability by default
- Value-based equality
- Concise syntax
- Built-in deconstruction

### 6. Pattern Matching for Validation

**Decision**: Used pattern matching expressions for request validation.

```csharp
var (statusCode, message) = exception switch
{
    ArgumentNullException => (HttpStatusCode.BadRequest, "Required parameter is missing"),
    KeyNotFoundException => (HttpStatusCode.NotFound, "Resource not found"),
    _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred")
};
```

**Benefits**:
- Cleaner than if-else chains
- Exhaustiveness checking
- Read naturally

### 7. Custom Middleware (No Framework Helpers)

**Decision**: Implemented middleware from scratch without using ASP.NET Core helpers.

```csharp
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    
    public async Task InvokeAsync(HttpContext context)
    {
        // Custom implementation
    }
}
```

**Demonstrates**:
- Understanding of the middleware pipeline
- HttpContext manipulation
- Request/response lifecycle

### 8. IComparable for Products

**Decision**: Product class implements `IComparable<Product>`.

```csharp
public int CompareTo(Product? other)
{
    int nameComparison = string.Compare(Name, other.Name, StringComparison.OrdinalIgnoreCase);
    if (nameComparison != 0) return nameComparison;
    return Price.CompareTo(other.Price);
}
```

**Use Case**: Enables using `List.Sort()` for natural ordering (by name, then price).

### 9. Angular Standalone Components

**Decision**: All components are standalone (Angular 18+).

```typescript
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, ...],
})
```

**Benefits**:
- No NgModule boilerplate
- Better tree-shaking
- Simpler dependency management
- Future-proof (Angular direction)

### 10. RxJS State Management

**Decision**: Used BehaviorSubjects for state management instead of NgRx.

```typescript
private productsSubject = new BehaviorSubject<Product[]>([]);
public products$ = this.productsSubject.asObservable();
```

**Rationale**:
- Simpler for small-medium applications
- No additional dependencies
- Easy to understand and test
- Sufficient for this use case

**Trade-off**: For larger apps, NgRx or similar would provide better debugging, dev tools, and structure.

## Assumptions Made

1. **Authentication/Authorization**: Skipped as per assignment guidelines
2. **Database**: In-memory is acceptable for demo; would use SQL Server/PostgreSQL in production
3. **Caching**: Single-server deployment; distributed cache (Redis) would be needed for scale
4. **Error Handling**: Basic error responses; production would need more detailed logging/monitoring

## What I Would Add With More Time

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control

2. **Better Search**
   - Elasticsearch integration for production
   - Search suggestions/autocomplete
   - Search history

3. **Performance Optimizations**
   - Response compression
   - ETag caching
   - Database indexing

4. **Testing**
   - Integration tests
   - E2E tests with Playwright/Cypress
   - Higher coverage

5. **DevOps**
   - Complete Docker setup
   - CI/CD pipeline
   - Health checks

6. **UI Enhancements**
   - Image upload for products
   - Bulk operations
   - Export to CSV/Excel
   - Dark mode

## Conclusion

This solution demonstrates proficiency in:
- Clean C# code with modern features (records, pattern matching, nullable refs)
- Generic programming and SOLID principles
- Custom algorithm implementation (fuzzy search)
- Angular best practices with TypeScript
- Reactive programming with RxJS
- Test-driven development

The architecture is scalable and maintainable, with clear separation of concerns that would allow for easy extension and modification.
