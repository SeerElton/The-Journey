import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { 
  Product, 
  CreateProductRequest, 
  UpdateProductRequest,
  ProductSearchResult 
} from '../models/product.model';
import { PaginatedResult } from '../models/api.model';
import { environment } from '../../environments/environment';

export interface ProductSearchParams {
  search?: string;
  categoryId?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;
  
  // State management using BehaviorSubject
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public products$ = this.productsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get paginated products with optional filtering
   */
  getProducts(params: ProductSearchParams = {}): Observable<PaginatedResult<Product>> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let httpParams = new HttpParams();
    
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.categoryId) {
      httpParams = httpParams.set('categoryId', params.categoryId.toString());
    }
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.pageSize) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDescending !== undefined) {
      httpParams = httpParams.set('sortDescending', params.sortDescending.toString());
    }

    return this.http.get<PaginatedResult<Product>>(this.apiUrl, { params: httpParams }).pipe(
      tap(result => {
        this.productsSubject.next(result.items);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next(error.message || 'Failed to load products');
        return throwError(() => error);
      })
    );
  }

  /**
   * Search products with fuzzy matching
   */
  searchProducts(query: string): Observable<ProductSearchResult[]> {
    return this.http.get<ProductSearchResult[]>(`${this.apiUrl}/search`, {
      params: new HttpParams().set('q', query)
    });
  }

  /**
   * Get a single product by ID
   */
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new product
   */
  createProduct(product: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      tap(() => {
        // Refresh products list after creation
        this.refreshProducts();
      })
    );
  }

  /**
   * Update an existing product
   */
  updateProduct(id: number, product: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product).pipe(
      tap(() => {
        this.refreshProducts();
      })
    );
  }

  /**
   * Delete a product
   */
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Remove from local state
        const currentProducts = this.productsSubject.value;
        this.productsSubject.next(currentProducts.filter(p => p.id !== id));
      })
    );
  }

  /**
   * Refresh the products list
   */
  private refreshProducts(): void {
    this.getProducts().subscribe();
  }

  /**
   * Clear any error state
   */
  clearError(): void {
    this.errorSubject.next(null);
  }
}
