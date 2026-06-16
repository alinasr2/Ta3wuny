import { Component, inject, OnInit, OnDestroy } from '@angular/core';
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

  stripe: any;
  elements: any;
  cardElement: any;
  cardMounted = false;
  cardPaymentDone = false;
  private isProcessingPayment = false;

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

    loadStripe(
      'pk_test_51TTOQIAwqAKNfyvHpfohQfRnUBex6FMPssqonwNXRKLt2ow2FKLmrNWjxyW2R412sVwN3xBzFJfiE5lGnpC0rMaZ00p7eL2QrQ',
    ).then((stripe) => {
      this.stripe = stripe;
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

  async nextStep() {
    if (this.currentStep === 1 && !this.selectedDeliveryMethod) return;

    if (this.currentStep === 2 && this.selectedPaymentMethod === PaymentMethod.Card) {
      await this.processCardPaymentBeforeNextStep();
      return;
    }

    this.currentStep++;
  }

  prevStep() {
    this.currentStep--;
  }

  selectPaymentMethod(method: PaymentMethod) {
    this.selectedPaymentMethod = method;

    if (method === PaymentMethod.Card) {
      setTimeout(() => this.initializeCardElement(), 0);
    } else {
      this.destroyCardElement();
    }
  }

  initializeCardElement() {
    if (!this.stripe) return;

    if (this.cardElement) {
      this.cardElement.unmount();
      this.cardElement.destroy();
      this.cardElement = null;
      this.cardMounted = false;
    }

    this.elements = this.stripe.elements();
    this.cardElement = this.elements.create('card');
    this.cardElement.mount('#card-element');
    this.cardMounted = true;
  }

  destroyCardElement() {
    if (this.cardElement) {
      this.cardElement.unmount();
      this.cardElement.destroy();
      this.cardElement = null;
      this.cardMounted = false;
    }
  }

  async confirmCardPayment(clientSecret: string): Promise<boolean> {
    const result = await this.stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: this.cardElement },
    });

    if (result.error) {
      this.errorMessage = result.error.message ?? 'فشل الدفع';
      return false;
    }

    return result.paymentIntent?.status === 'succeeded';
  }

  async processCardPaymentBeforeNextStep() {
    if (!this.basket || !this.selectedDeliveryMethod) return;

    // امنع الـ double call
    if (this.isProcessingPayment) return;
    this.isProcessingPayment = true;

    this.isSubmitting = true;
    this.errorMessage = null;

    const basketId = this.basket.id;
    const updatedBasket = { ...this.basket, deliveryMethodId: this.selectedDeliveryMethod.id };

    this.basketService.updateBasket(updatedBasket).subscribe({
      next: () => {
        this.ordersService.createPaymentIntent(basketId).subscribe({
          next: async (payRes) => {
            if (!payRes.isSuccess) {
              this.errorMessage = payRes.message;
              this.isSubmitting = false;
              this.isProcessingPayment = false;
              return;
            }

            const clientSecret = payRes.data.clientSecret;

            const paymentSucceeded = await this.confirmCardPayment(clientSecret);

            if (!paymentSucceeded) {
              this.isSubmitting = false;
              this.isProcessingPayment = false;
              return;
            }

            this.cardPaymentDone = true;
            this.isSubmitting = false;
            this.isProcessingPayment = false;
            this.currentStep++;
          },
          error: () => {
            this.errorMessage = 'حدث خطأ في Payment Intent';
            this.isSubmitting = false;
            this.isProcessingPayment = false;
          },
        });
      },
      error: () => {
        this.errorMessage = 'حدث خطأ في تحديث السلة';
        this.isSubmitting = false;
        this.isProcessingPayment = false;
      },
    });
  }

  placeOrder() {
    if (!this.basket || !this.selectedDeliveryMethod) return;

    const basketId = this.basket.id;
    this.isSubmitting = true;
    this.errorMessage = null;

    if (this.selectedPaymentMethod === PaymentMethod.Card && this.cardPaymentDone) {
      this.createOrderAndNavigate(basketId);
    } else {
      const updatedBasket = { ...this.basket, deliveryMethodId: this.selectedDeliveryMethod.id };

      this.basketService.updateBasket(updatedBasket).subscribe({
        next: () => {
          this.ordersService.createPaymentIntent(basketId).subscribe({
            next: () => {
              this.createOrderAndNavigate(basketId);
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
  }

  private createOrderAndNavigate(basketId: string) {
    this.ordersService
      .createOrder({
        notes: this.notes,
        paymentMethod: this.selectedPaymentMethod,
        basketId,
      })
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.basketService.deleteBasket(basketId).subscribe();
            this.router.navigate(['/order-confirmation', res.data.id]);
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
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.destroyCardElement();
  }
}
