import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUrl } from '../../../shared/environments/base-url';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly httpClient = inject(HttpClient);


  getAllCategories():Observable<any>
  {

    return this.httpClient.get(`${BaseUrl.url}api/Categories`)
  }
  
  getProducts(params: any): Observable<any> {
    let httpParams:any = {};

    if (params.sort)
      httpParams.Sort = params.sort

    if (params.sortDescending != null)
      httpParams.SortDescending = params.sortDescending

    if (params.categoryId != null)
      httpParams.CategoryId = params.categoryId

    if (params.farmerId)
      httpParams.FarmerId = params.farmerId

    if (params.hasActiveAuction != null)
      httpParams.HasActiveAuction = params.hasActiveAuction

    if (params.pageSize != null)
      httpParams.pageSize = params.pageSize

    if (params.pageIndex != null)
      httpParams.PageIndex = params.pageIndex

    if (params.search)
      httpParams.Search = params.search

    if (params.minPrice != null)
      httpParams.MinPrice = params.minPrice

    if (params.maxPrice != null)
      httpParams.MaxPrice = params.maxPrice

    if (params.status != null)
      httpParams.Status = params.status


    console.log(params);
    
    return this.httpClient.get(`${BaseUrl.url}api/Products`, { params: httpParams });
  }
}
