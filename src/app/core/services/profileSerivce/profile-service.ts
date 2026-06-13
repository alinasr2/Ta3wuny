import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseUrl } from '../../../shared/environments/base-url';

export interface ApiResponse<T = any> {
  isSuccess: boolean;
  message: string;
  data: T;
  errors: string[];
}

export interface Auction {
  id: number;
  productId: number;
  status: string;
  startDate: string;
  endDate: string;
  startingPrice: number;
  reservePrice: number;
  currentPrice: number;
  isEnded: boolean;
  minutesRemaining: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  harvestDate: string;
  expiryDate: string;
  status: number;
  createdAt: string;
  categoryId: number;
  categoryName: string;
  farmerId: string;
  farmerName: string;
  farmerGovernorate: string;
  farmerCity: string;
  imageUrls: string[];
  mainImageUrl: string;
  hasActiveAcution: boolean;
}

export interface ProductsResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: Product[];
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || `Error Code: ${error.status}`;
    }
    return throwError(() => ({ message: errorMessage, status: error.status }));
  }

  getMyAuctions(): Observable<ApiResponse<Auction[]>> {
    return this.http.get<ApiResponse<Auction[]>>(`${BaseUrl.url}api/Auctions/my`)
      .pipe(catchError(this.handleError));
  }

  getMyProducts(): Observable<ApiResponse<ProductsResponse>> {
    return this.http.get<ApiResponse<ProductsResponse>>(`${BaseUrl.url}api/Products/my-products`)
      .pipe(catchError(this.handleError));
  }

  addProduct(formData: FormData): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${BaseUrl.url}api/Products`, formData)
      .pipe(catchError(this.handleError));
  }

  editProduct(productData: any): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${BaseUrl.url}api/Products`, productData)
      .pipe(catchError(this.handleError));
  }

  deleteProduct(productId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${BaseUrl.url}api/Products/${productId}`)
      .pipe(catchError(this.handleError));
  }

  addProductImages(productId: number, image: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('Image', image);
    return this.http.post<ApiResponse<string>>(`${BaseUrl.url}api/Products/${productId}/images`, formData)
      .pipe(catchError(this.handleError));
  }

  setMainImage(productId: number, imageId: number): Observable<ApiResponse<string>> {
    return this.http.patch<ApiResponse<string>>(`${BaseUrl.url}api/Products/${productId}/images/${imageId}/set-main`, {})
      .pipe(catchError(this.handleError));
  }

  deleteImage(productId: number, imageId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${BaseUrl.url}api/Products/${productId}/images/${imageId}`)
      .pipe(catchError(this.handleError));
  }
}