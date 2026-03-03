import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { CategoryService } from '../../services/category.service';
import { Category, CategoryTree, CreateCategoryRequest, UpdateCategoryRequest } from '../../models';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="categories-page">
      <div class="categories-grid">
        <!-- Category List -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Categories</h2>
            <button class="btn btn-primary" (click)="showAddForm()">Add Category</button>
          </div>

          @if (error) {
            <div class="alert alert-error">
              {{ error }}
              <button class="btn-close" (click)="error = null">×</button>
            </div>
          }

          @if (loading) {
            <app-loading-spinner></app-loading-spinner>
          }

          @if (!loading && categories.length > 0) {
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Parent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (category of categories; track category.id) {
                    <tr>
                      <td><strong>{{ category.name }}</strong></td>
                      <td>{{ category.description || '-' }}</td>
                      <td>{{ category.parentCategoryName || 'Root' }}</td>
                      <td>
                        <div class="actions">
                          <button class="btn btn-secondary btn-sm" (click)="editCategory(category)">
                            Edit
                          </button>
                          <button class="btn btn-danger btn-sm" (click)="confirmDelete(category)">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @if (!loading && categories.length === 0) {
            <div class="empty-state">
              <p>No categories found.</p>
              <button class="btn btn-primary" (click)="showAddForm()">Add your first category</button>
            </div>
          }
        </div>

        <!-- Category Tree -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Category Tree</h2>
          </div>
          
          @if (categoryTree.length > 0) {
            <div class="category-tree">
              @for (node of categoryTree; track node.id) {
                <ng-container *ngTemplateOutlet="treeNode; context: { node: node, level: 0 }"></ng-container>
              }
            </div>
          } @else {
            <p class="text-center" style="padding: 20px; color: #6b7280;">No categories to display</p>
          }
        </div>
      </div>
    </div>

    <!-- Category Form Modal -->
    @if (showForm) {
      <div class="modal-backdrop" (click)="cancelForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">{{ isEditing ? 'Edit Category' : 'Add Category' }}</h3>
            <button class="modal-close" (click)="cancelForm()">×</button>
          </div>

          <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()">
            <div class="form-group">
              <label for="name">Name *</label>
              <input
                type="text"
                id="name"
                formControlName="name"
                class="form-control"
                [class.is-invalid]="isFieldInvalid('name')"
                placeholder="Enter category name"
              />
              @if (isFieldInvalid('name')) {
                <div class="invalid-feedback">Name is required</div>
              }
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                formControlName="description"
                class="form-control"
                rows="3"
                placeholder="Enter description (optional)"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="parentCategoryId">Parent Category</label>
              <select
                id="parentCategoryId"
                formControlName="parentCategoryId"
                class="form-control"
              >
                <option [ngValue]="null">None (Root Category)</option>
                @for (cat of availableParents; track cat.id) {
                  <option [ngValue]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="cancelForm()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="categoryForm.invalid || submitting">
                {{ submitting ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete confirmation dialog -->
    @if (showDeleteDialog && categoryToDelete) {
      <app-confirm-dialog
        [title]="'Delete Category'"
        [message]="'Are you sure you want to delete ' + categoryToDelete.name + '?'"
        [confirmText]="'Delete'"
        [cancelText]="'Cancel'"
        [isDestructive]="true"
        (confirm)="deleteCategory()"
        (cancel)="cancelDelete()"
      ></app-confirm-dialog>
    }

    <!-- Tree node template -->
    <ng-template #treeNode let-node="node" let-level="level">
      <div class="tree-item" [style.padding-left.px]="level * 20">
        <span class="tree-icon">{{ node.children.length > 0 ? '📁' : '📄' }}</span>
        <span class="tree-name">{{ node.name }}</span>
      </div>
      @for (child of node.children; track child.id) {
        <ng-container *ngTemplateOutlet="treeNode; context: { node: child, level: level + 1 }"></ng-container>
      }
    </ng-template>
  `,
  styles: [`
    .categories-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
    }

    @media (max-width: 1024px) {
      .categories-grid {
        grid-template-columns: 1fr;
      }
    }

    .table-container {
      overflow-x: auto;
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

    .category-tree {
      padding: 16px;
    }

    .tree-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .tree-item:last-child {
      border-bottom: none;
    }

    .tree-icon {
      font-size: 16px;
    }

    .tree-name {
      font-size: 14px;
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
export class CategoriesComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  categoryTree: CategoryTree[] = [];
  loading = false;
  error: string | null = null;

  showForm = false;
  isEditing = false;
  editingCategoryId: number | null = null;
  categoryForm!: FormGroup;
  submitting = false;

  showDeleteDialog = false;
  categoryToDelete: Category | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.loadCategoryTree();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      parentCategoryId: [null]
    });
  }

  get availableParents(): Category[] {
    if (!this.isEditing) {
      return this.categories;
    }
    // Exclude current category from parent options
    return this.categories.filter(c => c.id !== this.editingCategoryId);
  }

  loadCategories(): void {
    this.loading = true;
    this.error = null;

    this.categoryService.getCategories().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  loadCategoryTree(): void {
    this.categoryService.getCategoryTree().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (tree) => {
        this.categoryTree = tree;
      }
    });
  }

  showAddForm(): void {
    this.isEditing = false;
    this.editingCategoryId = null;
    this.categoryForm.reset();
    this.showForm = true;
  }

  editCategory(category: Category): void {
    this.isEditing = true;
    this.editingCategoryId = category.id;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      parentCategoryId: category.parentCategoryId
    });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.categoryForm.reset();
    this.editingCategoryId = null;
    this.isEditing = false;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      Object.keys(this.categoryForm.controls).forEach(key => {
        this.categoryForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    const formValue = this.categoryForm.value;

    if (this.isEditing && this.editingCategoryId) {
      const updateRequest: UpdateCategoryRequest = {
        name: formValue.name,
        description: formValue.description || null,
        parentCategoryId: formValue.parentCategoryId
      };

      this.categoryService.updateCategory(this.editingCategoryId, updateRequest).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.onSaveSuccess();
        },
        error: (err) => {
          this.error = err.message;
          this.submitting = false;
        }
      });
    } else {
      const createRequest: CreateCategoryRequest = {
        name: formValue.name,
        description: formValue.description || null,
        parentCategoryId: formValue.parentCategoryId
      };

      this.categoryService.createCategory(createRequest).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.onSaveSuccess();
        },
        error: (err) => {
          this.error = err.message;
          this.submitting = false;
        }
      });
    }
  }

  private onSaveSuccess(): void {
    this.submitting = false;
    this.showForm = false;
    this.categoryForm.reset();
    this.loadCategories();
    this.loadCategoryTree();
  }

  confirmDelete(category: Category): void {
    this.categoryToDelete = category;
    this.showDeleteDialog = true;
  }

  cancelDelete(): void {
    this.categoryToDelete = null;
    this.showDeleteDialog = false;
  }

  deleteCategory(): void {
    if (!this.categoryToDelete) return;

    this.categoryService.deleteCategory(this.categoryToDelete.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.showDeleteDialog = false;
        this.categoryToDelete = null;
        this.loadCategories();
        this.loadCategoryTree();
      },
      error: (err) => {
        this.error = err.message;
        this.showDeleteDialog = false;
      }
    });
  }
}
