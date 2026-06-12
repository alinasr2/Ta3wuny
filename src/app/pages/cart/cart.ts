import { Component, inject } from '@angular/core';
import { BasketService } from '../../core/services/basket/basket-service';
import { IBasket, IBasketItem } from '../../shared/interfaces/ibasket';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  private basketService = inject(BasketService);

  basket$: Observable<IBasket | null> = this.basketService.basket;

  constructor() {
    this.basketService.getBasket().subscribe();
  }

  getItemSubtotal(item: IBasketItem): number {
    return item.price * item.quantity;
  }

  getSubtotal(basket: IBasket): number {
    return basket.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  getTotal(basket: IBasket): number {
    return this.getSubtotal(basket) + (basket.shippingPrice ?? 0);
  }

  increaseQuantity(item: IBasketItem) {
    this.basketService.updateItemQuantity(item.productId, item.quantity + 1);
  }

  decreaseQuantity(item: IBasketItem) {
    if (item.quantity === 1) {
      this.removeItem(item);
    } else {
      this.basketService.updateItemQuantity(item.productId, item.quantity - 1);
    }
  }

  removeItem(item: IBasketItem) {
    this.basketService.removeItem(item.productId);
  }
}
