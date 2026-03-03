import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CategoryService } from './category.service';
import { Category, CategoryTree, CreateCategoryRequest, UpdateCategoryRequest } from '../models';
import { environment } from '../../environments/environment';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  const mockCategory: Category = {
    id: 1,
    name: 'Electronics',
    description: 'Electronic devices',
    parentCategoryId: null,
    parentCategoryName: null
  };

  const mockCategories: Category[] = [
    mockCategory,
    { id: 2, name: 'Computers', description: 'Computers', parentCategoryId: 1, parentCategoryName: 'Electronics' }
  ];

  const mockCategoryTree: CategoryTree[] = [
    {
      id: 1,
      name: 'Electronics',
      description: 'Electronic devices',
      children: [
        { id: 2, name: 'Computers', description: 'Computers', children: [] }
      ]
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryService]
    });

    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);

    // Handle the constructor's loadCategories() call which calls both getCategories() and getCategoryTree()
    const initCategoriesReq = httpMock.expectOne(`${environment.apiUrl}/categories`);
    initCategoriesReq.flush(mockCategories);
    
    const initTreeReq = httpMock.expectOne(`${environment.apiUrl}/categories/tree`);
    initTreeReq.flush(mockCategoryTree);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCategories', () => {
    it('should return categories', () => {
      service.getCategories().subscribe(categories => {
        expect(categories).toEqual(mockCategories);
        expect(categories.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/categories`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategories);
    });
  });

  describe('getCategoryTree', () => {
    it('should return category tree', () => {
      service.getCategoryTree().subscribe(tree => {
        expect(tree).toEqual(mockCategoryTree);
        expect(tree[0].children?.length).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/categories/tree`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategoryTree);
    });
  });

  describe('getCategory', () => {
    it('should return a single category by id', () => {
      service.getCategory(1).subscribe(category => {
        expect(category).toEqual(mockCategory);
        expect(category.id).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/categories/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategory);
    });
  });

  describe('createCategory', () => {
    it('should create a new category', () => {
      const createRequest: CreateCategoryRequest = {
        name: 'New Category',
        description: 'New description',
        parentCategoryId: null
      };

      service.createCategory(createRequest).subscribe(category => {
        expect(category.name).toBe('New Category');
      });

      const postReq = httpMock.expectOne(`${environment.apiUrl}/categories`);
      expect(postReq.request.method).toBe('POST');
      expect(postReq.request.body).toEqual(createRequest);
      postReq.flush({ ...mockCategory, ...createRequest });

      // createCategory calls loadCategories() which triggers both GET requests
      const getReq = httpMock.expectOne(`${environment.apiUrl}/categories`);
      getReq.flush(mockCategories);
      const treeReq = httpMock.expectOne(`${environment.apiUrl}/categories/tree`);
      treeReq.flush(mockCategoryTree);
    });
  });

  describe('updateCategory', () => {
    it('should update an existing category', () => {
      const updateRequest: UpdateCategoryRequest = {
        name: 'Updated Category',
        description: 'Updated description',
        parentCategoryId: null
      };

      service.updateCategory(1, updateRequest).subscribe(category => {
        expect(category.name).toBe('Updated Category');
      });

      const putReq = httpMock.expectOne(`${environment.apiUrl}/categories/1`);
      expect(putReq.request.method).toBe('PUT');
      expect(putReq.request.body).toEqual(updateRequest);
      putReq.flush({ ...mockCategory, ...updateRequest });

      // updateCategory calls loadCategories() which triggers both GET requests
      const getReq = httpMock.expectOne(`${environment.apiUrl}/categories`);
      getReq.flush(mockCategories);
      const treeReq = httpMock.expectOne(`${environment.apiUrl}/categories/tree`);
      treeReq.flush(mockCategoryTree);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', () => {
      service.deleteCategory(1).subscribe();

      const deleteReq = httpMock.expectOne(`${environment.apiUrl}/categories/1`);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush(null);
      // deleteCategory does not call loadCategories() - it just filters local state
    });
  });
});
