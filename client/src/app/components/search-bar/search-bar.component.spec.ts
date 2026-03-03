import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default placeholder', () => {
    expect(component.placeholder).toBe('Search...');
  });

  it('should accept custom placeholder', () => {
    component.placeholder = 'Search products...';
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.search-input');
    expect(input.placeholder).toBe('Search products...');
  });

  it('should emit search event on input', () => {
    spyOn(component.search, 'emit');
    component.searchTerm = 'laptop';
    component.onSearchInput();
    expect(component.search.emit).toHaveBeenCalledWith('laptop');
  });

  it('should clear search and emit empty string', () => {
    spyOn(component.search, 'emit');
    component.searchTerm = 'test';
    component.clearSearch();
    expect(component.searchTerm).toBe('');
    expect(component.search.emit).toHaveBeenCalledWith('');
  });

  it('should show clear button when search term exists', () => {
    component.searchTerm = 'test';
    fixture.detectChanges();
    const clearBtn = fixture.nativeElement.querySelector('.clear-btn');
    expect(clearBtn).toBeTruthy();
  });

  it('should hide clear button when search term is empty', () => {
    component.searchTerm = '';
    fixture.detectChanges();
    const clearBtn = fixture.nativeElement.querySelector('.clear-btn');
    expect(clearBtn).toBeFalsy();
  });
});
