# Product Catalog Client

Angular 18 frontend application for the Product Catalog Management System.

## Features

- Product listing with pagination and search
- Category filtering with hierarchical tree view
- Add/Edit/Delete products with form validation
- Category management
- Responsive design
- Standalone components (Angular 18+)

## Prerequisites

- Node.js 18+
- npm

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at `http://localhost:4200`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run unit tests |
| `npm run test:ci` | Run tests in CI mode |

## Project Structure

```
src/
├── app/
│   ├── components/         # Shared UI components
│   │   ├── category-filter/
│   │   ├── confirm-dialog/
│   │   ├── loading-spinner/
│   │   └── search-bar/
│   ├── interceptors/       # HTTP interceptors
│   ├── models/             # TypeScript interfaces
│   ├── pages/              # Page components
│   │   ├── categories/
│   │   ├── product-form/
│   │   └── products/
│   └── services/           # API services
├── environments/           # Environment configs
└── styles.css              # Global styles
```

## Key Technologies

- Angular 18 (Standalone Components)
- TypeScript (Strict Mode)
- RxJS
- Reactive Forms
