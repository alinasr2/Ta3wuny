import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrdersService } from '../../core/services/orders/orders-service';
import {
  IOrderDetails, PAYMENT_STATUS_MAP,
  PAYMENT_METHOD_MAP,
  ORDER_STATUS_MAP
} from '../../shared/interfaces/iorder';

@Component({
  selector: 'app-order-confirmation',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-confirmation.html',
})
export class OrderConfirmation implements OnInit {
  private route = inject(ActivatedRoute);
  private ordersService = inject(OrdersService);

  order: IOrderDetails | null = null;
  isLoading = true;
  error: string | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ordersService.getOrderById(+id).subscribe({
        next: (res) => {
          if (res.isSuccess) this.order = res.data;
          else this.error = res.message;
          this.isLoading = false;
        },
        error: () => {
          this.error = 'حدث خطأ في تحميل الطلب';
          this.isLoading = false;
        },
      });
    }
  }
  getPaymentStatusLabel(status: number): string {
    return PAYMENT_STATUS_MAP[status]?.label ?? 'غير معروف';
  }

  getPaymentStatusColor(status: number): string {
    return PAYMENT_STATUS_MAP[status]?.color ?? 'bg-gray-100 text-gray-700';
  }

  getPaymentMethodLabel(method: number): string {
    return PAYMENT_METHOD_MAP[method] ?? 'غير معروف';
  }

  getOrderStatusInfo(status: string) {
    return ORDER_STATUS_MAP[status] ?? { label: status, color: 'bg-gray-100 text-gray-700' };
  }
}
