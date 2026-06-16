import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersService } from '../../core/services/orders/orders-service';
import { IOrder } from '../../shared/interfaces/iorder';

@Component({
  selector: 'app-my-orders',
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.html',
})
export class MyOrders implements OnInit {
  private ordersService = inject(OrdersService);

  orders: IOrder[] = [];
  isLoading = true;
  error: string | null = null;

  statusMap: Record<string, { label: string; color: string }> = {
    Pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700' },
    Confirmed: { label: 'مؤكد', color: 'bg-blue-100 text-blue-700' },
    Preparing: { label: 'جاري التجهيز', color: 'bg-blue-100 text-blue-700' },
    ReadyForPickup: { label: 'جاهز للشحن', color: 'bg-purple-100 text-purple-700' },
    InDelivery: { label: 'في الطريق', color: 'bg-orange-100 text-orange-700' },
    Delivered: { label: 'تم التوصيل', color: 'bg-success/10 text-success' },
    Cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700' },
    Rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700' },
  };

  ngOnInit() {
    this.ordersService.getMyOrders().subscribe({
      next: (res) => {
        if (res.isSuccess) this.orders = res.data;
        else this.error = res.message;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'حدث خطأ في تحميل الطلبات';
        this.isLoading = false;
      },
    });
  }

  cancelOrder(orderId: number) {
    this.ordersService.cancelOrder(orderId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          const order = this.orders.find((o) => o.id === orderId);
          if (order) order.status = 'Cancelled';
        }
      },
    });
  }

  getStatusInfo(status: string) {
    return this.statusMap[status] ?? { label: status, color: 'bg-gray-100 text-gray-700' };
  }
}
