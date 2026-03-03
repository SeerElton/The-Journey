# Product Catalog Management System

A full-stack e-commerce product catalog management system built with **ASP.NET Core 8** (C#) and **Angular 18** (TypeScript).

---

## ⚠️ Disclosure

**This project was built with AI assistance.** I instructed GitHub Copilot (Claude) to implement this take-home assessment based on the provided requirements specification. The AI generated the code, architecture, and documentation under my direction and supervision.

---

## 🎬 Video Demo (Excuse me, i've rounded off my english to the nearest zulu)

> **Note:** To view the videos, please download them or watch via the links below.
> 
> GitHub does not support inline video playback from repository files. To enable playback:
> 1. Go to the [Issues](https://github.com/SeerElton/The-Journey/issues) tab
> 2. Create a new issue and drag-drop your video files into the comment
> 3. GitHub will generate playable URLs you can paste here

### Video 1: OMG, what just happened? I prompted by mistake then realized that the project is small so its safe to do this

[🎥 Click to download and watch Video 1](https://github.com/SeerElton/The-Journey/raw/main/videos/Video%201.webm)

---

### Video 2: I also figured i could fix my P.C with a prompt, it had this problem since i bought it 

[🎥 Click to download and watch Video 2](https://github.com/SeerElton/The-Journey/raw/main/videos/Video%202.webm)

---

### Video 3: The app works, hooray

[🎥 Click to download and watch Video 3](https://github.com/SeerElton/The-Journey/raw/main/videos/Video%203.webm)

---

## ✅ Assessment Requirements Checklist

### Backend Requirements (C# Web API)

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Custom `Repository<T>` base class using generics and interfaces | ✅ | [`Repository.cs`](server/ProductCatalog.Api/Repositories/Repository.cs) - Generic base with `IRepository<T>` interface |
| At least one repository using pure in-memory collections (List, Dictionary) | ✅ | [`CategoryRepository.cs`](server/ProductCatalog.Api/Repositories/CategoryRepository.cs) - Uses `Dictionary<int, Category>` instead of EF Core |
| Custom LINQ extension methods for product filtering | ✅ | [`ProductQueryExtensions.cs`](server/ProductCatalog.Api/Extensions/ProductQueryExtensions.cs) - `FilterByCategory()`, `SearchByTerm()`, `ApplySorting()` |
| Record types (C# 9+) for DTOs | ✅ | [`ProductDtos.cs`](server/ProductCatalog.Api/DTOs/ProductDtos.cs), [`CategoryDtos.cs`](server/ProductCatalog.Api/DTOs/CategoryDtos.cs) |
| Pattern matching for request validation | ✅ | [`Validators.cs`](server/ProductCatalog.Api/Validation/Validators.cs) - Uses `is { }` pattern matching |
| Nullable reference types (C# 8+) throughout | ✅ | `<Nullable>enable</Nullable>` in `.csproj`, all code uses nullable annotations |
| Custom middleware from scratch | ✅ | [`RequestLoggingMiddleware.cs`](server/ProductCatalog.Api/Middleware/RequestLoggingMiddleware.cs), [`ErrorHandlingMiddleware.cs`](server/ProductCatalog.Api/Middleware/ErrorHandlingMiddleware.cs) |
| Caching layer using `Dictionary<TKey, TValue>` | ✅ | [`SearchCacheService.cs`](server/ProductCatalog.Api/Services/SearchCacheService.cs) - `ConcurrentDictionary` with TTL expiration |
| Category tree structure (hierarchical categories) | ✅ | `GET /api/categories/tree` endpoint, `GetCategoryTreeAsync()` in repository |
| `IComparable` for products (custom sorting) | ✅ | [`Product.cs`](server/ProductCatalog.Api/Models/Product.cs) - Implements `IComparable<Product>` |
| Manual model binding demonstration | ✅ | `POST /api/products/manual-binding` - Reads raw request body and deserializes manually |
| Custom JSON serialization | ✅ | `GET /api/products/search` - Returns custom JSON with `SearchScore` field |
| DI pattern for `ProductSearchEngine` | ✅ | [`Program.cs`](server/ProductCatalog.Api/Program.cs) - `builder.Services.AddSingleton<ProductSearchEngine>()` |

### Core C# Challenge: ProductSearchEngine (No External Libraries)

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Efficient in-memory search algorithm | ✅ | [`ProductSearchEngine.cs`](server/ProductCatalog.Api/Services/ProductSearchEngine.cs) |
| Fuzzy matching (e.g., "lptop" → "laptop") | ✅ | Levenshtein distance algorithm implementation |
| Multi-field weighted scoring | ✅ | Configurable field weights (Name: 3.0, Description: 1.0, SKU: 2.0) |
| Generic/reusable for other entities | ✅ | `Search<T>()` method accepts any entity type with field selector |
| Uses ONLY .NET BCL (no NuGet packages) | ✅ | Pure C# implementation, no external dependencies |

### API Endpoints

| Endpoint | Status |
|----------|--------|
| `GET /api/products` (pagination, filtering, search) | ✅ |
| `GET /api/products/{id}` | ✅ |
| `POST /api/products` | ✅ |
| `PUT /api/products/{id}` | ✅ |
| `DELETE /api/products/{id}` | ✅ |
| `GET /api/categories` (flat list) | ✅ |
| `GET /api/categories/tree` (hierarchical tree) | ✅ |
| `POST /api/categories` | ✅ |

### Data Models

| Model | Fields | Status |
|-------|--------|--------|
| Product | Id, Name, Description, SKU, Price, Quantity, CategoryId, CreatedAt, UpdatedAt | ✅ |
| Category | Id, Name, Description, ParentCategoryId (nullable for root) | ✅ |

### Frontend Requirements (Angular + TypeScript)

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Angular 16+ with standalone components | ✅ | Angular 18, all components use `standalone: true` |
| TypeScript interfaces for all data models | ✅ | [`product.model.ts`](client/src/app/models/product.model.ts), [`category.model.ts`](client/src/app/models/category.model.ts) |
| Reactive forms with validation | ✅ | [`product-form.component.ts`](client/src/app/pages/product-form/product-form.component.ts) - FormBuilder with Validators |
| Error handling and user feedback | ✅ | Error messages in UI, loading states, confirmation dialogs |
| RxJS for API calls and state | ✅ | All services use HttpClient observables with RxJS operators |
| Angular best practices | ✅ | Component structure, services, dependency injection |
| Unit tests | ✅ | [`product.service.spec.ts`](client/src/app/services/product.service.spec.ts) |

### UI Components

| Component | Status |
|-----------|--------|
| Product list with grid/table view | ✅ |
| Product form (add/edit) | ✅ |
| Search bar component | ✅ |
| Category filter dropdown | ✅ |
| Loading indicators | ✅ |
| Delete confirmation dialog | ✅ |

### Deliverables

| Item | Status |
|------|--------|
| Complete source code (backend + frontend) | ✅ |
| README.md with build/run instructions | ✅ |
| SOLUTION.md with design decisions | ✅ |
| Docker support | ✅ |

---

## Features

- **Product Management**: CRUD operations for products with validation
- **Category Management**: Hierarchical category tree support
- **Search**: Advanced fuzzy search with weighted scoring
- **Pagination**: Paginated product listing with filters
- **Inventory Tracking**: Stock level indicators

## Tech Stack

### Backend
- ASP.NET Core 8 Web API
- Entity Framework Core (In-Memory Database)
- C# 12 with nullable reference types
- Custom repository pattern with generics
- Custom middleware for logging and error handling

### Frontend
- Angular 18 with standalone components
- TypeScript with strict mode
- Reactive Forms with validation
- RxJS for state management
- Clean, responsive UI

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- npm or yarn

## Getting Started

### Clone the Repository

```bash
git clone <repository-url>
cd "The Journey"
```

### Run the Backend

```bash
cd server/ProductCatalog.Api
dotnet restore
dotnet run
```

The API will be available at `http://localhost:5000`

Swagger documentation: `http://localhost:5000/swagger`

### Run the Frontend

```bash
cd client
npm install
npm start
```

The Angular app will be available at `http://localhost:4200`

### Run Both Together (Recommended)

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd server/ProductCatalog.Api
dotnet run --urls "http://localhost:5000"
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

## Running Tests

### Backend Tests

```bash
cd server/ProductCatalog.Tests
dotnet test
```

### Frontend Tests

```bash
cd client
npm test
```

For CI/headless:
```bash
npm run test:ci
```

## API Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get paginated products (with search & filter) |
| GET | `/api/products/{id}` | Get product by ID |
| GET | `/api/products/search?q=term` | Fuzzy search with scoring |
| POST | `/api/products` | Create a new product |
| PUT | `/api/products/{id}` | Update a product |
| DELETE | `/api/products/{id}` | Delete a product |
| POST | `/api/products/manual-binding` | Create product with manual model binding |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get flat list of categories |
| GET | `/api/categories/tree` | Get hierarchical category tree |
| GET | `/api/categories/{id}` | Get category by ID |
| POST | `/api/categories` | Create a new category |
| PUT | `/api/categories/{id}` | Update a category |
| DELETE | `/api/categories/{id}` | Delete a category |

### Query Parameters for Products

- `search` - Search term for name/description/SKU
- `categoryId` - Filter by category
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 10)
- `sortBy` - Sort field (name, price, quantity, sku, createdat, updatedat)
- `sortDescending` - Sort direction (default: false)

## Project Structure

```
├── client/                     # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # Shared UI components
│   │   │   ├── interceptors/   # HTTP interceptors
│   │   │   ├── models/         # TypeScript interfaces
│   │   │   ├── pages/          # Page components
│   │   │   └── services/       # API services
│   │   └── environments/       # Environment configs
│   └── package.json
│
├── server/                     # ASP.NET Core backend
│   ├── ProductCatalog.Api/
│   │   ├── Controllers/        # API controllers
│   │   ├── Data/               # DbContext and seeder
│   │   ├── DTOs/               # Data transfer objects (records)
│   │   ├── Extensions/         # LINQ extensions
│   │   ├── Middleware/         # Custom middleware
│   │   ├── Models/             # Entity models
│   │   ├── Repositories/       # Repository pattern
│   │   ├── Services/           # Business services
│   │   └── Validation/         # Validators
│   └── ProductCatalog.Tests/   # Unit tests
│
├── docker-compose.yaml         # Docker configuration
└── README.md                   # This file
```

## License

This project is for demonstration purposes only.
