import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { 
  Category, 
  CategoryTree,
  CreateCategoryRequest, 
  UpdateCategoryRequest 
} from '../models/category.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}/categories`;
  
  // State management using BehaviorSubject
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  private categoryTreeSubject = new BehaviorSubject<CategoryTree[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public categories$ = this.categoriesSubject.asObservable();
  public categoryTree$ = this.categoryTreeSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load categories on service initialization
    this.loadCategories();
  }

  /**
   * Get flat list of all categories
   */
  getCategories(): Observable<Category[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<Category[]>(this.apiUrl).pipe(
      tap(categories => {
        this.categoriesSubject.next(categories);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next(error.message || 'Failed to load categories');
        return throwError(() => error);
      })
    );
  }

  /**
   * Get hierarchical category tree
   */
  getCategoryTree(): Observable<CategoryTree[]> {
    return this.http.get<CategoryTree[]>(`${this.apiUrl}/tree`).pipe(
      tap(tree => {
        this.categoryTreeSubject.next(tree);
      })
    );
  }

  /**
   * Get a single category by ID
   */
  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new category
   */
  createCategory(category: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category).pipe(
      tap(() => {
        this.loadCategories();
      })
    );
  }

  /**
   * Update an existing category
   */
  updateCategory(id: number, category: UpdateCategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category).pipe(
      tap(() => {
        this.loadCategories();
      })
    );
  }

  /**
   * Delete a category
   */
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentCategories = this.categoriesSubject.value;
        this.categoriesSubject.next(currentCategories.filter(c => c.id !== id));
      })
    );
  }

  /**
   * Load both flat and tree categories
   */
  private loadCategories(): void {
    this.getCategories().subscribe();
    this.getCategoryTree().subscribe();
  }

  /**
   * Clear any error state
   */
  clearError(): void {
    this.errorSubject.next(null);
  }
}
