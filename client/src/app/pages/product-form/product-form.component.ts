import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Product, Category, CreateProductRequest, UpdateProductRequest } from '../../models';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="product-form-page">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</h2>
        </div>

        @if (loading) {
          <app-loading-spinner></app-loading-spinner>
        }

        @if (error) {
          <div class="alert alert-error">
            {{ error }}
          </div>
        }

        @if (!loading) {
          <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label for="name">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  formControlName="name"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('name')"
                  placeholder="Enter product name"
                />
                @if (isFieldInvalid('name')) {
                  <div class="invalid-feedback">
                    @if (productForm.get('name')?.errors?.['required']) {
                      Name is required
                    }
                    @if (productForm.get('name')?.errors?.['maxlength']) {
                      Name cannot exceed 200 characters
                    }
                  </div>
                }
              </div>

              <div class="form-group">
                <label for="sku">SKU *</label>
                <input
                  type="text"
                  id="sku"
                  formControlName="sku"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('sku')"
                  placeholder="Enter SKU"
                />
                @if (isFieldInvalid('sku')) {
                  <div class="invalid-feedback">
                    @if (productForm.get('sku')?.errors?.['required']) {
                      SKU is required
                    }
                    @if (productForm.get('sku')?.errors?.['maxlength']) {
                      SKU cannot exceed 50 characters
                    }
                  </div>
                }
              </div>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                formControlName="description"
                class="form-control"
                rows="3"
                placeholder="Enter product description (optional)"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="price">Price *</label>
                <input
                  type="number"
                  id="price"
                  formControlName="price"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('price')"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
                @if (isFieldInvalid('price')) {
                  <div class="invalid-feedback">
                    @if (productForm.get('price')?.errors?.['required']) {
                      Price is required
                    }
                    @if (productForm.get('price')?.errors?.['min']) {
                      Price cannot be negative
                    }
                  </div>
                }
              </div>

              <div class="form-group">
                <label for="quantity">Quantity *</label>
                <input
                  type="number"
                  id="quantity"
                  formControlName="quantity"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('quantity')"
                  min="0"
                  placeholder="0"
                />
                @if (isFieldInvalid('quantity')) {
                  <div class="invalid-feedback">
                    @if (productForm.get('quantity')?.errors?.['required']) {
                      Quantity is required
                    }
                    @if (productForm.get('quantity')?.errors?.['min']) {
                      Quantity cannot be negative
                    }
                  </div>
                }
              </div>

              <div class="form-group">
                <label for="categoryId">Category</label>
                <select
                  id="categoryId"
                  formControlName="categoryId"
                  class="form-control"
                >
                  <option [ngValue]="null">No category</option>
                  @for (category of categories; track category.id) {
                    <option [ngValue]="category.id">{{ category.name }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="form-actions">
              <a routerLink="/products" class="btn btn-secondary">Cancel</a>
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="productForm.invalid || submitting"
              >
                {{ submitting ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product') }}
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 80px;
    }
  `]
})
export class ProductFormComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  categories: Category[] = [];
  loading = false;
  submitting = false;
  error: string | null = null;
  isEditMode = false;
  productId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    
    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = parseInt(id, 10);
      this.loadProduct(this.productId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      sku: ['', [Validators.required, Validators.maxLength(50)]],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null]
    });
  }

  private loadCategories(): void {
    this.categoryService.getCategories().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (categories) => {
        this.categories = categories;
      }
    });
  }

  private loadProduct(id: number): void {
    this.loading = true;
    this.productService.getProduct(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (product: Product) => {
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          sku: product.sku,
          price: product.price,
          quantity: product.quantity,
          categoryId: product.categoryId
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.error = null;

    const formValue = this.productForm.value;

    if (this.isEditMode && this.productId) {
      const updateRequest: UpdateProductRequest = {
        name: formValue.name,
        description: formValue.description || null,
        sku: formValue.sku,
        price: formValue.price,
        quantity: formValue.quantity,
        categoryId: formValue.categoryId
      };

      this.productService.updateProduct(this.productId, updateRequest).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.error = err.message;
          this.submitting = false;
        }
      });
    } else {
      const createRequest: CreateProductRequest = {
        name: formValue.name,
        description: formValue.description || null,
        sku: formValue.sku,
        price: formValue.price,
        quantity: formValue.quantity,
        categoryId: formValue.categoryId
      };

      this.productService.createProduct(createRequest).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.error = err.message;
          this.submitting = false;
        }
      });
    }
  }
}
