import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersService } from '../../core/services/orders/orders-service';
import { IOrder } from '../../shared/interfaces/iorder';
import { ReviewService } from '../../core/services/Reviews/review-service';
import { ProductsService } from '../../core/services/products/products-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-orders',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './my-orders.html',
})
export class MyOrders implements OnInit {
  private ordersService = inject(OrdersService);
  private reviewService = inject(ReviewService);
  private productService = inject(ProductsService);

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

  showReviewModal = false;
  selectedOrder: IOrder | null = null;
  reviewRating = 5;
  reviewComment = '';
  isSubmittingReview = false;
  reviewError: string | null = null;
  reviewSuccess = false;
  private reviewedOrderIds = new Set<number>();

  ngOnInit() {
    this.ordersService.getMyOrders().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.orders = res.data;
          this.syncReviewedOrders();
        }
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

  openReviewModal(order: IOrder) {
    if (!this.canReviewOrder(order)) return;

    this.selectedOrder = order;
    this.reviewRating = 5;
    this.reviewComment = '';
    this.reviewError = null;
    this.reviewSuccess = false;
    this.showReviewModal = true;
  }

  closeReviewModal() {
    this.showReviewModal = false;
    this.selectedOrder = null;
  }

  submitReview() {
    if (!this.selectedOrder) return;
    this.isSubmittingReview = true;
    this.reviewError = null;

    const productId = this.selectedOrder.items[0]?.productId;
    if (!productId) {
      this.reviewError = 'حدث خطأ في جلب بيانات المنتج';
      this.isSubmittingReview = false;
      return;
    }
    this.productService.getProductById(productId).subscribe({
      next: (productRes) => {
        if (!productRes.isSuccess) {
          this.reviewError = 'حدث خطأ في جلب بيانات المنتج';
          this.isSubmittingReview = false;
          return;
        }
        const farmerId = productRes.data.farmerId;
        this.reviewService
          .createReview({
            orderId: this.selectedOrder!.id,
            targetUserId: farmerId,
            rating: this.reviewRating,
            comment: this.reviewComment,
          })
          .subscribe({
            next: (res) => {
              if (res.isSuccess) {
                this.markOrderAsReviewed(this.selectedOrder!.id);
                this.reviewSuccess = true;
                setTimeout(() => this.closeReviewModal(), 2000);
              } else {
                this.reviewError = res.message;
                this.handleAlreadyReviewedResponse(res.message);
              }
              this.isSubmittingReview = false;
            },
            error: (error) => {
              const message = error?.error?.message || 'حدث خطأ في إرسال التقييم';
              this.reviewError = message;
              this.handleAlreadyReviewedResponse(message);
              this.isSubmittingReview = false;
            },
          });
      },
      error: () => {
        this.reviewError = 'حدث خطأ في جلب بيانات المنتج';
        this.isSubmittingReview = false;
      },
    });
  }

  setRating(rating: number) {
    this.reviewRating = rating;
  }

  canReviewOrder(order: IOrder): boolean {
    return order.status === 'Delivered' && !this.isOrderReviewed(order);
  }

  isOrderReviewed(order: IOrder): boolean {
    const orderData = order as IOrder & Record<string, unknown>;
    return (
      this.reviewedOrderIds.has(order.id) ||
      orderData['isReviewed'] === true ||
      orderData['hasReview'] === true ||
      orderData['hasReviewed'] === true ||
      orderData['reviewed'] === true
    );
  }

  private syncReviewedOrders(): void {
    this.orders.forEach((order) => {
      if (this.isOrderReviewed(order)) this.reviewedOrderIds.add(order.id);
    });
  }

  private markOrderAsReviewed(orderId: number): void {
    this.reviewedOrderIds.add(orderId);
    const order = this.orders.find((item) => item.id === orderId) as
      | (IOrder & Record<string, unknown>)
      | undefined;
    if (order) order['isReviewed'] = true;
  }

  private handleAlreadyReviewedResponse(message: string | null | undefined): void {
    if (!message?.includes('بالفعل') || !this.selectedOrder) return;
    this.markOrderAsReviewed(this.selectedOrder.id);
  }
}
