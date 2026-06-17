import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrdersService } from '../../core/services/orders/orders-service';
import { BasketService } from '../../core/services/basket/basket-service';
import { IBasket } from '../../shared/interfaces/ibasket';
import { DELIVERY_METHODS, IDeliveryMethod, PaymentMethod } from '../../shared/interfaces/iorder';
import { loadStripe } from '@stripe/stripe-js';

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
  private cdr = inject(ChangeDetectorRef);

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
    { value: PaymentMethod.Card, label: 'بطاقة ائتمان', icon: 'pi-credit-card' },
  ];

  stripe: any;
  elements: any;
  cardElement: any;
  cardMounted = false;
  cardReady = false;

  ngOnInit() {
    this.sub.add(
      this.basketService.basket.subscribe((basket) => {
        if (!basket || basket.items.length === 0) {
          this.router.navigate(['/cart']);
          return;
        }
        this.basket = basket;
        this.cdr.detectChanges();
      }),
    );

    loadStripe(
      'pk_test_51TTOQIAwqAKNfyvHpfohQfRnUBex6FMPssqonwNXRKLt2ow2FKLmrNWjxyW2R412sVwN3xBzFJfiE5lGnpC0rMaZ00p7eL2QrQ',
    ).then((stripe) => {
      this.stripe = stripe;
      if (this.selectedPaymentMethod === PaymentMethod.Card) {
        setTimeout(() => this.initializeCardElement(), 0);
      }
    });
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

  getPaymentLabel(): string {
    return (
      this.paymentMethods.find((method) => method.value === this.selectedPaymentMethod)?.label ??
      'غير محدد'
    );
  }

  nextStep() {
    if (this.currentStep === 1 && !this.selectedDeliveryMethod) return;
    if (this.currentStep === 2 && this.selectedPaymentMethod === PaymentMethod.Card) {
      this.initializeCardElement();

      if (!this.cardReady) {
        this.errorMessage = 'بيانات البطاقة لسه بتجهز. انتظر لحظة وحاول مرة أخرى.';
        return;
      }
    }

    this.errorMessage = null;
    this.currentStep++;
  }

  prevStep() {
    this.currentStep--;
  }

  selectPaymentMethod(method: PaymentMethod) {
    this.selectedPaymentMethod = method;
    this.errorMessage = null;

    if (method === PaymentMethod.Card) {
      setTimeout(() => this.initializeCardElement(), 0);
    }
  }

  initializeCardElement() {
    if (!this.stripe || this.cardMounted) return;
    if (!document.getElementById('card-element')) return;

    this.elements = this.stripe.elements();
    this.cardElement = this.elements.create('card');
    this.cardElement.on('ready', () => {
      this.cardReady = true;
      this.cdr.detectChanges();
    });
    this.cardElement.on('change', (event: any) => {
      this.errorMessage = event.error?.message ?? null;
      this.cdr.detectChanges();
    });
    this.cardElement.mount('#card-element');
    this.cardMounted = true;
  }

  destroyCardElement() {
    if (this.cardElement) {
      this.cardElement.unmount();
      this.cardElement.destroy();
      this.cardElement = null;
      this.cardMounted = false;
      this.cardReady = false;
    }
  }

  async confirmCardPayment(clientSecret: string): Promise<boolean> {
    if (!this.stripe || !this.cardElement || !this.cardMounted || !this.cardReady) {
      this.errorMessage = 'بيانات البطاقة غير جاهزة. ارجع لخطوة الدفع وحاول مرة أخرى.';
      return false;
    }

    try {
      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: this.cardElement },
      });

      if (result.error) {
        this.errorMessage = result.error.message ?? 'فشل الدفع';
        return false;
      }

      return result.paymentIntent?.status === 'succeeded';
    } catch (error: any) {
      this.errorMessage = error?.message ?? 'فشل الدفع';
      return false;
    }
  }

  placeOrder() {
    if (!this.basket || !this.selectedDeliveryMethod || this.isSubmitting) return;

    const basketId = this.basket.id;
    this.isSubmitting = true;
    this.errorMessage = null;

    const updatedBasket = { ...this.basket, deliveryMethodId: this.selectedDeliveryMethod.id };

    this.basketService.updateBasket(updatedBasket).subscribe({
      next: () => {
        if (this.selectedPaymentMethod === PaymentMethod.Card) {
          this.placeCardOrder(basketId);
          return;
        }

        this.placeCashOrder(basketId);
      },
      error: () => {
        this.errorMessage = 'حدث خطأ في تحديث السلة';
        this.isSubmitting = false;
      },
    });
  }

  private placeCardOrder(basketId: string) {
    if (!this.cardMounted) {
      this.initializeCardElement();
    }

    if (!this.stripe || !this.cardElement || !this.cardMounted || !this.cardReady) {
      this.errorMessage = 'بيانات البطاقة غير جاهزة. ارجع لخطوة الدفع وحاول مرة أخرى.';
      this.isSubmitting = false;
      return;
    }

    this.ordersService.createPaymentIntent(basketId).subscribe({
      next: (payRes) => {
        if (!payRes.isSuccess) {
          this.errorMessage = payRes.message;
          this.isSubmitting = false;
          return;
        }

        const clientSecret = payRes.data.clientSecret;

        this.ordersService
          .createOrder({
            notes: this.notes,
            paymentMethod: this.selectedPaymentMethod,
            basketId,
          })
          .subscribe({
            next: async (orderRes) => {
              if (!orderRes.isSuccess) {
                this.errorMessage = orderRes.message;
                this.isSubmitting = false;
                return;
              }

              const paymentSucceeded = await this.confirmCardPayment(clientSecret);
              if (!paymentSucceeded) {
                this.isSubmitting = false;
                return;
              }

              this.finishOrder(basketId, orderRes.data.id);
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
  }

  private placeCashOrder(basketId: string) {
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
            next: (orderRes) => {
              if (!orderRes.isSuccess) {
                this.errorMessage = orderRes.message;
                this.isSubmitting = false;
                return;
              }

              this.finishOrder(basketId, orderRes.data.id);
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
  }

  private finishOrder(basketId: string, orderId: number) {
    this.basketService.deleteBasket(basketId).subscribe();
    this.router.navigate(['/order-confirmation', orderId]);
    this.isSubmitting = false;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.destroyCardElement();
  }
}
