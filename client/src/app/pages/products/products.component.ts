import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { ProductService, ProductSearchParams } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Product, Category, PaginatedResult } from '../../models';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { CategoryFilterComponent } from '../../components/category-filter/category-filter.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    SearchBarComponent,
    CategoryFilterComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="products-page">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Products</h2>
          <a routerLink="/products/new" class="btn btn-primary">Add Product</a>
        </div>

        <!-- Filters -->
        <div class="filters">
          <app-search-bar
            [placeholder]="'Search products...'"
            (search)="onSearch($event)"
          ></app-search-bar>
          
          <app-category-filter
            [categories]="categories"
            [selectedCategoryId]="searchParams.categoryId ?? null"
            (categoryChange)="onCategoryChange($event)"
          ></app-category-filter>
        </div>

        <!-- Error message -->
        @if (error) {
          <div class="alert alert-error">
            {{ error }}
            <button class="btn-close" (click)="clearError()">×</button>
          </div>
        }

        <!-- Loading state -->
        @if (loading) {
          <app-loading-spinner></app-loading-spinner>
        }

        <!-- Products table -->
        @if (!loading && products.length > 0) {
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (product of products; track product.id) {
                  <tr>
                    <td>
                      <strong>{{ product.name }}</strong>
                      @if (product.description) {
                        <p class="description">{{ product.description }}</p>
                      }
                    </td>
                    <td><code>{{ product.sku }}</code></td>
                    <td>{{ product.categoryName || '-' }}</td>
                    <td>{{ product.price | currency }}</td>
                    <td>{{ product.quantity }}</td>
                    <td>
                      @if (product.quantity > 10) {
                        <span class="badge badge-success">In Stock</span>
                      } @else if (product.quantity > 0) {
                        <span class="badge badge-warning">Low Stock</span>
                      } @else {
                        <span class="badge badge-danger">Out of Stock</span>
                      }
                    </td>
                    <td>
                      <div class="actions">
                        <a [routerLink]="['/products', product.id, 'edit']" class="btn btn-secondary btn-sm">
                          Edit
                        </a>
                        <button class="btn btn-danger btn-sm" (click)="confirmDelete(product)">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages > 1) {
            <div class="pagination">
              <button 
                [disabled]="currentPage === 1"
                (click)="goToPage(currentPage - 1)"
              >
                Previous
              </button>
              <span>Page {{ currentPage }} of {{ totalPages }}</span>
              <button 
                [disabled]="currentPage === totalPages"
                (click)="goToPage(currentPage + 1)"
              >
                Next
              </button>
            </div>
          }
        }

        <!-- Empty state -->
        @if (!loading && products.length === 0) {
          <div class="empty-state">
            <p>No products found.</p>
            <a routerLink="/products/new" class="btn btn-primary">Add your first product</a>
          </div>
        }
      </div>
    </div>

    <!-- Delete confirmation dialog -->
    @if (showDeleteDialog && productToDelete) {
      <app-confirm-dialog
        [title]="'Delete Product'"
        [message]="'Are you sure you want to delete ' + productToDelete.name + '? This action cannot be undone.'"
        [confirmText]="'Delete'"
        [cancelText]="'Cancel'"
        [isDestructive]="true"
        (confirm)="deleteProduct()"
        (cancel)="cancelDelete()"
      ></app-confirm-dialog>
    }
  `,
  styles: [`
    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .table-container {
      overflow-x: auto;
    }

    .description {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }

    code {
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #6b7280;
    }

    .empty-state p {
      margin-bottom: 16px;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      margin-left: 8px;
    }
  `]
})
export class ProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  categories: Category[] = [];
  loading = false;
  error: string | null = null;
  
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalCount = 0;

  searchParams: ProductSearchParams = {
    page: 1,
    pageSize: 10
  };

  showDeleteDialog = false;
  productToDelete: Product | null = null;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();

    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchParams.search = searchTerm || undefined;
      this.searchParams.page = 1;
      this.loadProducts();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getProducts(this.searchParams).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result: PaginatedResult<Product>) => {
        this.products = result.items;
        this.currentPage = result.page;
        this.totalPages = result.totalPages;
        this.totalCount = result.totalCount;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (categories) => {
        this.categories = categories;
      }
    });
  }

  onSearch(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  onCategoryChange(categoryId: number | null): void {
    this.searchParams.categoryId = categoryId ?? undefined;
    this.searchParams.page = 1;
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.searchParams.page = page;
      this.loadProducts();
    }
  }

  confirmDelete(product: Product): void {
    this.productToDelete = product;
    this.showDeleteDialog = true;
  }

  cancelDelete(): void {
    this.productToDelete = null;
    this.showDeleteDialog = false;
  }

  deleteProduct(): void {
    if (!this.productToDelete) return;

    this.productService.deleteProduct(this.productToDelete.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.showDeleteDialog = false;
        this.productToDelete = null;
        this.loadProducts();
      },
      error: (err) => {
        this.error = err.message;
        this.showDeleteDialog = false;
      }
    });
  }

  clearError(): void {
    this.error = null;
  }
}
