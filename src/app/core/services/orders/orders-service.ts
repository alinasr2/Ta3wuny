import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICreateOrder } from '../../../shared/interfaces/iorder';
import { BaseUrl } from '../../../shared/environments/base-url';
@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private http = inject(HttpClient);

  createOrder(order: ICreateOrder): Observable<any> {
    return this.http.post(`${BaseUrl.url}api/Orders`, order);
  }

  getMyOrders(): Observable<any> {
    return this.http.get(`${BaseUrl.url}api/Orders`);
  }

  getOrderById(orderId: number): Observable<any> {
    return this.http.get(`${BaseUrl.url}api/Orders/${orderId}`);
  }

  cancelOrder(orderId: number): Observable<any> {
    return this.http.patch(`${BaseUrl.url}api/Orders/${orderId}/cancel`, {});
  }

  createPaymentIntent(basketId: string): Observable<any> {
    return this.http.post(`${BaseUrl.url}api/Payments/${basketId}`, {});
  }
}
