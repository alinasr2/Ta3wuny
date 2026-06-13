import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUrl } from '../../../shared/environments/base-url';

@Injectable({
  providedIn: 'root',
})
export class AuctionsService {
  private http = inject(HttpClient);
  baseUrl = BaseUrl.url;
  createAuction(auctionData: {
    productId: number;
    startDate: string;
    endDate: string;
    startingPrice: number;
    reservePrice: number;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}api/Auctions`, auctionData);
  }

  getAllAuctions(params?: {
    productId?: number;
    farmerId?: string;
    winnerId?: string;
    status?: 0 | 1 | 2 | 3 | 4;
    sort?: string;
    sortDescending?: boolean;
    pageSize?: number;
    pageIndex?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.productId !== undefined) {
        httpParams = httpParams.set('ProductId', params.productId.toString());
      }
      if (params.farmerId) {
        httpParams = httpParams.set('FarmerId', params.farmerId);
      }
      if (params.winnerId) {
        httpParams = httpParams.set('WinnerId', params.winnerId);
      }
      if (params.status !== undefined) {
        httpParams = httpParams.set('Status', params.status.toString());
      }
      if (params.sort) {
        httpParams = httpParams.set('Sort', params.sort);
      }
      if (params.sortDescending !== undefined) {
        httpParams = httpParams.set('SortDescending', params.sortDescending.toString());
      }
      if (params.pageSize !== undefined) {
        httpParams = httpParams.set('pageSize', params.pageSize.toString());
      }
      if (params.pageIndex !== undefined) {
        httpParams = httpParams.set('PageIndex', params.pageIndex.toString()+1);
      }
    }
    
    return this.http.get(`${this.baseUrl}api/Auctions`, { params: httpParams });
  }

  getAuctionById(auctionId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}api/Auctions/${auctionId}`);
  }

  deleteAuction(auctionId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}api/Auctions/${auctionId}`);
  }

  getAuctionByProductId(productId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}api/Auctions/products/${productId}`);
  }

  getMyAuctions(): Observable<any> {
    return this.http.get(`${this.baseUrl}api/Auctions/my`);
  }

  placeBid(auctionId: number, bidData: { amount: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}api/Auctions/${auctionId}/bids`, bidData);
  }

  getAuctionBids(auctionId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}api/Auctions/${auctionId}/bids`);
  }

  getMyBids(): Observable<any> {
    return this.http.get(`${this.baseUrl}api/Auctions/my/bids`);
  }
}