import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { CategoriesComponent } from './categories.component';
import { CategoryService } from '../../services/category.service';
import { Category, CategoryTree } from '../../models';

describe('CategoriesComponent', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;
  let categoryServiceSpy: jasmine.SpyObj<CategoryService>;

  const mockCategories: Category[] = [
    { id: 1, name: 'Electronics', description: 'Electronic devices', parentCategoryId: null, parentCategoryName: null },
    { id: 2, name: 'Computers', description: 'Computers', parentCategoryId: 1, parentCategoryName: 'Electronics' },
    { id: 3, name: 'Clothing', description: 'Apparel', parentCategoryId: null, parentCategoryName: null }
  ];

  const mockCategoryTree: CategoryTree[] = [
    { 
      id: 1, 
      name: 'Electronics', 
      description: 'Electronic devices',
      children: [
        { id: 2, name: 'Computers', description: 'Computers', children: [] }
      ]
    },
    { id: 3, name: 'Clothing', description: 'Apparel', children: [] }
  ];

  beforeEach(async () => {
    categoryServiceSpy = jasmine.createSpyObj('CategoryService', [
      'getCategories',
      'getCategoryTree',
      'createCategory',
      'updateCategory',
      'deleteCategory'
    ]);
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    categoryServiceSpy.getCategoryTree.and.returnValue(of(mockCategoryTree));
    categoryServiceSpy.createCategory.and.returnValue(of(mockCategories[0]));
    categoryServiceSpy.deleteCategory.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [CategoriesComponent, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        { provide: CategoryService, useValue: categoryServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    expect(categoryServiceSpy.getCategories).toHaveBeenCalled();
  });

  it('should load category tree on init', () => {
    expect(categoryServiceSpy.getCategoryTree).toHaveBeenCalled();
  });

  it('should display categories in the table', () => {
    component.categories = mockCategories;
    component.loading = false;
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(3);
  });

  it('should initialize category form', () => {
    expect(component.categoryForm).toBeTruthy();
    expect(component.categoryForm.get('name')).toBeTruthy();
    expect(component.categoryForm.get('description')).toBeTruthy();
    expect(component.categoryForm.get('parentCategoryId')).toBeTruthy();
  });

  it('should have required validator on name', () => {
    const nameControl = component.categoryForm.get('name');
    nameControl?.setValue('');
    expect(nameControl?.hasError('required')).toBeTrue();
  });

  it('should show form on showAddForm', () => {
    component.showAddForm();
    expect(component.showForm).toBeTrue();
    expect(component.isEditing).toBeFalse();
  });

  it('should populate form on editCategory', () => {
    component.editCategory(mockCategories[0]);
    expect(component.showForm).toBeTrue();
    expect(component.isEditing).toBeTrue();
    expect(component.categoryForm.get('name')?.value).toBe('Electronics');
  });

  it('should reset form on cancelForm', () => {
    component.showForm = true;
    component.isEditing = true;
    component.cancelForm();
    expect(component.showForm).toBeFalse();
    expect(component.isEditing).toBeFalse();
  });

  it('should show delete confirmation on confirmDelete', () => {
    component.confirmDelete(mockCategories[0]);
    expect(component.showDeleteDialog).toBeTrue();
    expect(component.categoryToDelete).toBe(mockCategories[0]);
  });

  it('should hide delete dialog on cancelDelete', () => {
    component.showDeleteDialog = true;
    component.categoryToDelete = mockCategories[0];
    component.cancelDelete();
    expect(component.showDeleteDialog).toBeFalse();
    expect(component.categoryToDelete).toBeNull();
  });

  it('should filter available parents excluding current category in edit mode', () => {
    component.categories = mockCategories;
    component.editCategory(mockCategories[0]);
    expect(component.availableParents.find(c => c.id === 1)).toBeFalsy();
  });

  it('should show empty state when no categories', () => {
    component.categories = [];
    component.loading = false;
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
  });
});
