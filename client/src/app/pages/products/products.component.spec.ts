import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { ProductsComponent } from './products.component';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Product, Category, PaginatedResult } from '../../models';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let categoryServiceSpy: jasmine.SpyObj<CategoryService>;

  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Laptop Pro',
      description: 'High-performance laptop',
      sku: 'LAP-001',
      price: 1299.99,
      quantity: 50,
      categoryId: 1,
      categoryName: 'Computers',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse',
      sku: 'MOU-001',
      price: 49.99,
      quantity: 5,
      categoryId: 1,
      categoryName: 'Computers',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  const mockPaginatedResult: PaginatedResult<Product> = {
    items: mockProducts,
    totalCount: 2,
    page: 1,
    pageSize: 10,
    totalPages: 1
  };

  const mockCategories: Category[] = [
    { id: 1, name: 'Computers', description: 'Computers', parentCategoryId: null, parentCategoryName: null }
  ];

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj('ProductService', ['getProducts', 'deleteProduct'], {
      products$: of(mockProducts),
      loading$: of(false),
      error$: of(null)
    });
    productServiceSpy.getProducts.and.returnValue(of(mockPaginatedResult));
    productServiceSpy.deleteProduct.and.returnValue(of(void 0));

    categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getCategories']);
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));

    await TestBed.configureTestingModule({
      imports: [ProductsComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: CategoryService, useValue: categoryServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    expect(productServiceSpy.getProducts).toHaveBeenCalled();
  });

  it('should load categories on init', () => {
    expect(categoryServiceSpy.getCategories).toHaveBeenCalled();
  });

  it('should display products in the table', () => {
    component.products = mockProducts;
    component.loading = false;
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should show In Stock badge for products with quantity > 10', () => {
    component.products = [mockProducts[0]]; // quantity: 50
    component.loading = false;
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.badge-success');
    expect(badge).toBeTruthy();
    expect(badge.textContent.trim()).toBe('In Stock');
  });

  it('should show Low Stock badge for products with quantity <= 10 and > 0', () => {
    component.products = [mockProducts[1]]; // quantity: 5
    component.loading = false;
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.badge-warning');
    expect(badge).toBeTruthy();
    expect(badge.textContent.trim()).toBe('Low Stock');
  });

  it('should update search params on search', fakeAsync(() => {
    component.onSearch('laptop');
    tick(300); // debounce time
    expect(component.searchParams.search).toBe('laptop');
  }));

  it('should update search params on category change', () => {
    component.onCategoryChange(2);
    expect(component.searchParams.categoryId).toBe(2);
  });

  it('should show delete dialog on confirmDelete', () => {
    component.confirmDelete(mockProducts[0]);
    expect(component.showDeleteDialog).toBeTrue();
    expect(component.productToDelete).toBe(mockProducts[0]);
  });

  it('should cancel delete and close dialog', () => {
    component.showDeleteDialog = true;
    component.productToDelete = mockProducts[0];
    component.cancelDelete();
    expect(component.showDeleteDialog).toBeFalse();
    expect(component.productToDelete).toBeNull();
  });

  it('should show empty state when no products', () => {
    component.products = [];
    component.loading = false;
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
  });
});
