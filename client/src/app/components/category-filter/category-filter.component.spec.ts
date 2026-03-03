import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { CategoryFilterComponent } from './category-filter.component';
import { Category } from '../../models';

describe('CategoryFilterComponent', () => {
  let component: CategoryFilterComponent;
  let fixture: ComponentFixture<CategoryFilterComponent>;

  const mockCategories: Category[] = [
    { id: 1, name: 'Electronics', description: 'Electronic devices', parentCategoryId: null, parentCategoryName: null },
    { id: 2, name: 'Computers', description: 'Computers and laptops', parentCategoryId: 1, parentCategoryName: 'Electronics' },
    { id: 3, name: 'Clothing', description: 'Apparel', parentCategoryId: null, parentCategoryName: null }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryFilterComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default empty categories', () => {
    expect(component.categories).toEqual([]);
  });

  it('should have default null selected category', () => {
    expect(component.selectedCategoryId).toBeNull();
  });

  it('should render categories in select', () => {
    component.categories = mockCategories;
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('option');
    // +1 for "All Categories" option
    expect(options.length).toBe(mockCategories.length + 1);
  });

  it('should emit categoryChange event on selection', () => {
    spyOn(component.categoryChange, 'emit');
    component.onCategoryChange(2);
    expect(component.categoryChange.emit).toHaveBeenCalledWith(2);
  });

  it('should emit null when All Categories is selected', () => {
    spyOn(component.categoryChange, 'emit');
    component.onCategoryChange(null);
    expect(component.categoryChange.emit).toHaveBeenCalledWith(null);
  });
});
