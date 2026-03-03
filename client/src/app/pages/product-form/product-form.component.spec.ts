import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let categoryServiceSpy: jasmine.SpyObj<CategoryService>;

  const mockCategories: Category[] = [
    { id: 1, name: 'Electronics', description: 'Electronic devices', parentCategoryId: null, parentCategoryName: null },
    { id: 2, name: 'Computers', description: 'Computers', parentCategoryId: 1, parentCategoryName: 'Electronics' }
  ];

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj('ProductService', ['getProduct', 'createProduct', 'updateProduct']);
    productServiceSpy.createProduct.and.returnValue(of({
      id: 1,
      name: 'New Product',
      description: '',
      sku: 'NEW-001',
      price: 99.99,
      quantity: 10,
      categoryId: 1,
      categoryName: 'Electronics',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }));

    categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getCategories']);
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));

    await TestBed.configureTestingModule({
      imports: [
        ProductFormComponent, 
        HttpClientTestingModule, 
        RouterTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: CategoryService, useValue: categoryServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({})
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in add mode when no id in route', () => {
    expect(component.isEditMode).toBeFalse();
  });

  it('should load categories on init', () => {
    expect(categoryServiceSpy.getCategories).toHaveBeenCalled();
    expect(component.categories.length).toBe(2);
  });

  it('should initialize form with empty values in add mode', () => {
    expect(component.productForm.get('name')?.value).toBe('');
    expect(component.productForm.get('sku')?.value).toBe('');
    expect(component.productForm.get('price')?.value).toBe(0);
    expect(component.productForm.get('quantity')?.value).toBe(0);
  });

  it('should have required validators on name', () => {
    const nameControl = component.productForm.get('name');
    nameControl?.setValue('');
    expect(nameControl?.hasError('required')).toBeTrue();
  });

  it('should have required validators on sku', () => {
    const skuControl = component.productForm.get('sku');
    skuControl?.setValue('');
    expect(skuControl?.hasError('required')).toBeTrue();
  });

  it('should have min validator on price', () => {
    const priceControl = component.productForm.get('price');
    priceControl?.setValue(-10);
    expect(priceControl?.hasError('min')).toBeTrue();
  });

  it('should have min validator on quantity', () => {
    const quantityControl = component.productForm.get('quantity');
    quantityControl?.setValue(-5);
    expect(quantityControl?.hasError('min')).toBeTrue();
  });

  it('should mark form as invalid when required fields are empty', () => {
    component.productForm.patchValue({
      name: '',
      sku: '',
      price: 0,
      quantity: 0,
      categoryId: 1
    });
    expect(component.productForm.valid).toBeFalse();
  });

  it('should mark form as valid when all required fields are filled', () => {
    component.productForm.patchValue({
      name: 'Test Product',
      description: 'Test description',
      sku: 'TEST-001',
      price: 99.99,
      quantity: 10,
      categoryId: 1
    });
    expect(component.productForm.valid).toBeTrue();
  });

  it('should call createProduct when submitting in add mode', () => {
    component.productForm.patchValue({
      name: 'Test Product',
      description: 'Test description',
      sku: 'TEST-001',
      price: 99.99,
      quantity: 10,
      categoryId: 1
    });

    component.onSubmit();
    expect(productServiceSpy.createProduct).toHaveBeenCalled();
  });

  it('should detect invalid field correctly', () => {
    const nameControl = component.productForm.get('name');
    nameControl?.setValue('');
    nameControl?.markAsTouched();
    expect(component.isFieldInvalid('name')).toBeTrue();
  });
});
