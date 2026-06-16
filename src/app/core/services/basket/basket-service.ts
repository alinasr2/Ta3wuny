import { Injectable, inject } from '@angular/core';
import { BaseUrl } from '../../../shared/environments/base-url';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { IBasket, IBasketItem, IBasketResponse } from '../../../shared/interfaces/ibasket';
import { Auth } from '../auth/auth';

@Injectable({
  providedIn: 'root',
})
export class BasketService {
  private httpClient = inject(HttpClient);
  private authService = inject(Auth);

  private basketKey = 'basketId';
  private basket$ = new BehaviorSubject<IBasket | null>(null);
  basket = this.basket$.asObservable();

  private getUserId(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.uid ?? null;
  }

  getBasket(): Observable<IBasketResponse> {
    const userId = this.getUserId();

    return this.httpClient
      .get<IBasketResponse>(`${BaseUrl.url}api/Baskets`, {
        params: { userId: userId ?? '' },
      })
      .pipe(
        tap((res) => {
          console.log('basket response:', res);
          if (res.isSuccess && res.data) {
            this.basket$.next(res.data);
            localStorage.setItem(this.basketKey, res.data.id);
          } else {
            this.basket$.next(null);
            localStorage.removeItem(this.basketKey);
          }
        }),
        catchError(() => {
          this.basket$.next(null);
          localStorage.removeItem(this.basketKey);
          return of(null as any);
        }),
      );
  }

  updateBasket(basket: IBasket): Observable<IBasketResponse> {
    return this.httpClient.post<IBasketResponse>(`${BaseUrl.url}api/Baskets`, basket).pipe(
      tap((res) => {
        if (res.isSuccess && res.data) {
          localStorage.setItem(this.basketKey, res.data.id);
          this.basket$.next(res.data);
        }
      }),
    );
  }

  private addOrUpdateItem(items: IBasketItem[], newItem: IBasketItem): IBasketItem[] {
    const existingItem = items.find((i) => i.productId === newItem.productId);
    if (existingItem) {
      return items.map((i) =>
        i.productId === newItem.productId ? { ...i, quantity: i.quantity + newItem.quantity } : i,
      );
    }
    return [...items, newItem];
  }

  private createEmptyBasket(): IBasket {
    const basket: IBasket = {
      id: crypto.randomUUID(),
      items: [],
      deliveryMethodId: 0,
    };
    localStorage.setItem(this.basketKey, basket.id);
    return basket;
  }

  addItemToBasket(item: IBasketItem): void {
    const currentBasket = this.basket$.value ?? this.createEmptyBasket();
    const updatedItems = this.addOrUpdateItem(currentBasket.items, item);
    this.updateBasket({ ...currentBasket, items: updatedItems }).subscribe();
  }

  updateItemQuantity(productId: number, quantity: number): void {
    const currentBasket = this.basket$.value;
    if (!currentBasket) return;
    const updatedItems = currentBasket.items.map((item) =>
      item.productId === productId ? { ...item, quantity } : item,
    );
    this.updateBasket({ ...currentBasket, items: updatedItems }).subscribe();
  }

  removeItem(productId: number): void {
    const currentBasket = this.basket$.value;
    if (!currentBasket) return;

    const updatedItems = currentBasket.items.filter((item) => item.productId !== productId);

    this.updateBasket({ ...currentBasket, items: updatedItems }).subscribe();
  }

  deleteBasket(basketId?: string): Observable<any> {
    const userId = this.getUserId();
    const params: any = {};
    if (basketId) params.basketId = basketId;
    else if (userId) params.userId = userId;
    return this.httpClient
      .delete(`${BaseUrl.url}api/Baskets`, {
        params,
      })
      .pipe(
        tap(() => {
          localStorage.removeItem(this.basketKey);
          this.basket$.next(null);
        }),
      );
  }
}
