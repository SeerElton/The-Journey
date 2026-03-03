import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../models';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="category-filter">
      <select
        [ngModel]="selectedCategoryId"
        (ngModelChange)="onCategoryChange($event)"
        class="filter-select"
      >
        <option [ngValue]="null">All Categories</option>
        @for (category of categories; track category.id) {
          <option [ngValue]="category.id">{{ category.name }}</option>
        }
      </select>
    </div>
  `,
  styles: [`
    .category-filter {
      min-width: 180px;
    }

    .filter-select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      background-color: white;
      cursor: pointer;
      transition: border-color 0.2s ease;
    }

    .filter-select:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
  `]
})
export class CategoryFilterComponent {
  @Input() categories: Category[] = [];
  @Input() selectedCategoryId: number | null = null;
  @Output() categoryChange = new EventEmitter<number | null>();

  onCategoryChange(categoryId: number | null): void {
    this.categoryChange.emit(categoryId);
  }
}
