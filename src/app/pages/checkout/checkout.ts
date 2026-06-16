import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrdersService } from '../../core/services/orders/orders-service';
import { BasketService } from '../../core/services/basket/basket-service';
import { IBasket } from '../../shared/interfaces/ibasket';
import { DELIVERY_METHODS, IDeliveryMethod, PaymentMethod } from '../../shared/interfaces/iorder';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
})
export class Checkout implements OnInit, OnDestroy {
  private ordersService = inject(OrdersService);
  private basketService = inject(BasketService);
  private router = inject(Router);
  private sub = new Subscription();

  currentStep = 1;
  basket: IBasket | null = null;
  deliveryMethods = DELIVERY_METHODS;
  selectedDeliveryMethod: IDeliveryMethod | null = null;
  selectedPaymentMethod: PaymentMethod = PaymentMethod.CashOnDelivery;
  PaymentMethod = PaymentMethod;
  notes = '';
  isSubmitting = false;
  errorMessage: string | null = null;

  paymentMethods = [
    { value: PaymentMethod.CashOnDelivery, label: 'الدفع عند الاستلام', icon: 'pi-money-bill' },
    { value: PaymentMethod.BankTransfer, label: 'تحويل بنكي', icon: 'pi-building-columns' },
    { value: PaymentMethod.Wallet, label: 'محفظة إلكترونية', icon: 'pi-wallet' },
    { value: PaymentMethod.Card, label: 'بطاقة ائتمان', icon: 'pi-credit-card' },
  ];

  ngOnInit() {
    this.sub.add(
      this.basketService.basket.subscribe((basket) => {
        if (!basket || basket.items.length === 0) {
          this.router.navigate(['/cart']);
          return;
        }
        this.basket = basket;
      }),
    );
  }

  getSubtotal(): number {
    return this.basket?.items.reduce((acc, item) => acc + item.price * item.quantity, 0) ?? 0;
  }

  getShippingCost(): number {
    return this.selectedDeliveryMethod?.cost ?? 0;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShippingCost();
  }

  nextStep() {
    if (this.currentStep === 1 && !this.selectedDeliveryMethod) return;
    this.currentStep++;
  }

  prevStep() {
    this.currentStep--;
  }

  placeOrder() {
    if (!this.basket || !this.selectedDeliveryMethod) return;

    const basketId = this.basket.id;
    this.isSubmitting = true;
    this.errorMessage = null;

    const updatedBasket = {
      ...this.basket,
      deliveryMethodId: this.selectedDeliveryMethod.id,
    };

    this.basketService.updateBasket(updatedBasket).subscribe({
      next: () => {
        this.ordersService.createPaymentIntent(basketId).subscribe({
          next: (payRes) => {
            if (!payRes.isSuccess) {
              this.errorMessage = payRes.message;
              this.isSubmitting = false;
              return;
            }

            this.ordersService
              .createOrder({
                notes: this.notes,
                paymentMethod: this.selectedPaymentMethod,
                basketId,
              })
              .subscribe({
                next: (res) => {
                  if (res.isSuccess) {
                    this.basketService.deleteBasket(basketId).subscribe({
                      next: () => {
                        this.router.navigate(['/order-confirmation', res.data.id]);
                      },
                      error: () => {
                        this.router.navigate(['/order-confirmation', res.data.id]);
                      },
                    });
                  } else {
                    this.errorMessage = res.message;
                  }
                  this.isSubmitting = false;
                },
                error: () => {
                  this.errorMessage = 'حدث خطأ في إنشاء الطلب';
                  this.isSubmitting = false;
                },
              });
          },
          error: () => {
            this.errorMessage = 'حدث خطأ في Payment Intent';
            this.isSubmitting = false;
          },
        });
      },
      error: () => {
        this.errorMessage = 'حدث خطأ في تحديث السلة';
        this.isSubmitting = false;
      },
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
