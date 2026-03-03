import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ProductService, ProductSearchParams } from './product.service';
import { Product, PaginatedResult } from '../models';
import { environment } from '../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    description: 'Test description',
    sku: 'TEST-001',
    price: 99.99,
    quantity: 10,
    categoryId: 1,
    categoryName: 'Test Category',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockPaginatedResult: PaginatedResult<Product> = {
    items: [mockProduct],
    totalCount: 1,
    page: 1,
    pageSize: 10,
    totalPages: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    it('should return paginated products', () => {
      const params: ProductSearchParams = { page: 1, pageSize: 10 };

      service.getProducts(params).subscribe(result => {
        expect(result).toEqual(mockPaginatedResult);
        expect(result.items.length).toBe(1);
        expect(result.items[0].name).toBe('Test Product');
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/products?page=1&pageSize=10`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResult);
    });

    it('should include search term in request', () => {
      const params: ProductSearchParams = { search: 'laptop', page: 1, pageSize: 10 };

      service.getProducts(params).subscribe();

      const req = httpMock.expectOne(
        `${environment.apiUrl}/products?search=laptop&page=1&pageSize=10`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResult);
    });

    it('should include category filter in request', () => {
      const params: ProductSearchParams = { categoryId: 1, page: 1, pageSize: 10 };

      service.getProducts(params).subscribe();

      const req = httpMock.expectOne(
        `${environment.apiUrl}/products?categoryId=1&page=1&pageSize=10`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResult);
    });
  });

  describe('getProduct', () => {
    it('should return a single product by id', () => {
      service.getProduct(1).subscribe(product => {
        expect(product).toEqual(mockProduct);
        expect(product.id).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/products/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);
    });
  });

  describe('createProduct', () => {
    it('should create a new product', () => {
      const createRequest = {
        name: 'New Product',
        description: 'New description',
        sku: 'NEW-001',
        price: 49.99,
        quantity: 5,
        categoryId: 1
      };

      service.createProduct(createRequest).subscribe(product => {
        expect(product.name).toBe('New Product');
      });

      // Expect POST request first
      const postReq = httpMock.expectOne(`${environment.apiUrl}/products`);
      expect(postReq.request.method).toBe('POST');
      expect(postReq.request.body).toEqual(createRequest);
      postReq.flush({ ...mockProduct, ...createRequest });

      // createProduct calls refreshProducts() which triggers a GET
      const getReq = httpMock.expectOne(req => req.url.includes('/products') && req.method === 'GET');
      getReq.flush(mockPaginatedResult);
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', () => {
      const updateRequest = {
        name: 'Updated Product',
        description: 'Updated description',
        sku: 'UPD-001',
        price: 79.99,
        quantity: 15,
        categoryId: 2
      };

      service.updateProduct(1, updateRequest).subscribe(product => {
        expect(product.name).toBe('Updated Product');
      });

      // Expect PUT request first
      const putReq = httpMock.expectOne(`${environment.apiUrl}/products/1`);
      expect(putReq.request.method).toBe('PUT');
      expect(putReq.request.body).toEqual(updateRequest);
      putReq.flush({ ...mockProduct, ...updateRequest });

      // updateProduct calls refreshProducts() which triggers a GET
      const getReq = httpMock.expectOne(req => req.url.includes('/products') && req.method === 'GET');
      getReq.flush(mockPaginatedResult);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', () => {
      service.deleteProduct(1).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/products/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('state management', () => {
    it('should update products$ observable after getProducts', () => {
      let productsReceived: Product[] = [];
      service.products$.subscribe(products => {
        productsReceived = products;
      });

      service.getProducts({}).subscribe();

      const req = httpMock.expectOne(req => req.url.includes('/products'));
      req.flush(mockPaginatedResult);

      expect(productsReceived.length).toBe(1);
      expect(productsReceived[0].name).toBe('Test Product');
    });

    it('should update loading$ observable during request', () => {
      const loadingStates: boolean[] = [];
      service.loading$.subscribe(loading => {
        loadingStates.push(loading);
      });

      service.getProducts({}).subscribe();

      // Should be loading after request starts
      expect(loadingStates).toContain(true);

      const req = httpMock.expectOne(req => req.url.includes('/products'));
      req.flush(mockPaginatedResult);

      // Should not be loading after request completes
      expect(loadingStates[loadingStates.length - 1]).toBe(false);
    });
  });
});
