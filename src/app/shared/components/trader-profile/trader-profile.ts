// trader-profile.ts
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TraderProfileService } from '../../../core/services/trader-profile/trader-profile-service';

type ActiveTab = 'overview' | 'orders' | 'auctions';

const ORDER_STATUS_MAP: Record<string, { label: string; bgClass: string; textClass: string; icon: string }> = {
  Pending:        { label: 'في الانتظار',   bgClass: 'bg-yellow-50', textClass: 'text-yellow-700', icon: 'hourglass_empty' },
  Confirmed:      { label: 'مؤكد',          bgClass: 'bg-blue-50',   textClass: 'text-blue-700',   icon: 'check'          },
  Preparing:      { label: 'قيد التحضير',   bgClass: 'bg-purple-50', textClass: 'text-purple-700', icon: 'inventory'      },
  ReadyForPickup: { label: 'جاهز للاستلام', bgClass: 'bg-cyan-50',   textClass: 'text-cyan-700',   icon: 'local_shipping' },
  Delivered:      { label: 'تم التوصيل',    bgClass: 'bg-green-50',  textClass: 'text-green-700',  icon: 'done_all'       },
  Cancelled:      { label: 'ملغي',          bgClass: 'bg-gray-100',  textClass: 'text-gray-500',   icon: 'cancel'         },
  Rejected:       { label: 'مرفوض',         bgClass: 'bg-red-50',    textClass: 'text-red-600',    icon: 'block'          },
};

const PAYMENT_STATUS_MAP: Record<string, { label: string; bgClass: string; textClass: string }> = {
  Pending:   { label: 'قيد الانتظار', bgClass: 'bg-yellow-50', textClass: 'text-yellow-700' },
  Paid:      { label: 'مدفوع',        bgClass: 'bg-green-50',  textClass: 'text-green-700'  },
  Failed:    { label: 'فشل',          bgClass: 'bg-red-50',    textClass: 'text-red-600'    },
  Refunded:  { label: 'مسترد',        bgClass: 'bg-gray-100',  textClass: 'text-gray-500'   },
};

const BUSINESS_TYPES: Record<number, string> = {
  0: 'مزرعة',
  1: 'تاجر جملة',
  2: 'موزع',
  3: 'مصنع',
  4: 'أخرى',
};

@Component({
  selector: 'app-trader-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './trader-profile.html',
  styleUrls: ['./trader-profile.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraderProfile implements OnInit {
  private traderService = inject(TraderProfileService);
  private snackBar = inject(MatSnackBar);

  // ── Active Tab ──────────────────────────────────────────
  activeTab = signal<ActiveTab>('overview');

  // ── Profile ─────────────────────────────────────────────
  profile = signal<any>(null);
  profileLoading = signal(false);
  profileError = signal<string | null>(null);

  // Edit profile modal
  showEditModal = signal(false);
  editForm = signal<Record<string, any>>({
    name: '',
    businessName: '',
    businessType: '',
    taxNumber: '',
    description: '',
  });
  editLoading = signal(false);

  // Profile image
  profileImageLoading = signal(false);

  // ── Orders ───────────────────────────────────────────────
  orders = signal<any[]>([]);
  ordersLoading = signal(false);
  orderActionLoading = signal(false);

  // Order details
  showOrderDetails = signal(false);
  selectedOrder = signal<any>(null);
  selectedOrderLogistics = signal<any>(null);
  selectedOrderPayments = signal<any[]>([]);
  orderDetailsLoading = signal(false);

  // ── Auctions ─────────────────────────────────────────────
  auctions = signal<any[]>([]);
  auctionsLoading = signal(false);

  // ── Computed ─────────────────────────────────────────────
  totalOrders = computed(() => this.orders().length);
  pendingOrders = computed(() => this.orders().filter(o => o.status === 'Pending').length);
  winningAuctions = computed(() => this.auctions().filter(a => a.isEnded).length);

  ngOnInit(): void {
    this.loadProfile();
  }

  // ── Tab Navigation ───────────────────────────────────────
  setTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
    if (tab === 'orders' && this.orders().length === 0) this.loadOrders();
    if (tab === 'auctions' && this.auctions().length === 0) this.loadAuctions();
  }

  // ── Profile ─────────────────────────────────────────────
  loadProfile(): void {
    this.profileLoading.set(true);
    this.traderService.getMyTraderProfile().subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.profile.set(res.data);
          const p = res.data;
          this.editForm.set({
            name: p.name || '',
            businessName: p.businessName || '',
            businessType: p.businessType?.toString() || '',
            taxNumber: p.taxNumber?.toString() || '',
            description: p.description || '',
          });
        } else {
          this.profileError.set(res?.message ?? 'خطأ في تحميل البروفايل');
        }
        this.profileLoading.set(false);
      },
      error: () => {
        this.profileError.set('تعذّر الاتصال بالخادم');
        this.profileLoading.set(false);
      },
    });
  }

  openEditModal(): void {
    const p = this.profile();
    this.editForm.set({
      name: p?.name || '',
      businessName: p?.businessName || '',
      businessType: p?.businessType?.toString() || '',
      taxNumber: p?.taxNumber?.toString() || '',
      description: p?.description || '',
    });
    this.showEditModal.set(true);
  }

  saveProfile(): void {
    this.editLoading.set(true);
    const form = this.editForm();

    const payload = {
      name: form['name'],
      businessName: form['businessName'],
      businessType: parseInt(form['businessType']) || 0,
      description: form['description'],
    };

    this.traderService.updateMyTraderProfile(payload).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.profile.set(res.data);
          this.showEditModal.set(false);
          this.notify('✅ تم حفظ البروفايل بنجاح');
        } else {
          this.notify(res?.message ?? 'حدث خطأ', true);
        }
        this.editLoading.set(false);
      },
      error: () => { this.notify('تعذّر الحفظ', true); this.editLoading.set(false); },
    });
  }

  onProfileImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.profileImageLoading.set(true);
    const formData = new FormData();
    formData.append('Image', file);
    this.traderService.updateProfileImage(formData).subscribe({
      next: (res) => {
        if (res?.isSuccess) { this.loadProfile(); this.notify('✅ تم تحديث الصورة'); }
        else this.notify(res?.message ?? 'فشل رفع الصورة', true);
        this.profileImageLoading.set(false);
      },
      error: () => { this.notify('فشل رفع الصورة', true); this.profileImageLoading.set(false); },
    });
  }

  // ── Orders ───────────────────────────────────────────────
  loadOrders(): void {
    this.ordersLoading.set(true);
    this.traderService.getMyOrders().subscribe({
      next: (res) => {
        if (res?.isSuccess) this.orders.set(res.data);
        this.ordersLoading.set(false);
      },
      error: () => this.ordersLoading.set(false),
    });
  }

  cancelOrder(id: number): void {
    if (!confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;
    this.orderActionLoading.set(true);
    this.traderService.cancelOrder(id).subscribe({
      next: (res) => {
        if (res?.isSuccess) { this.loadOrders(); this.notify('✅ تم إلغاء الطلب'); }
        else this.notify(res?.message ?? 'فشل الإلغاء', true);
        this.orderActionLoading.set(false);
      },
      error: () => { this.notify('فشل الإلغاء', true); this.orderActionLoading.set(false); },
    });
  }

  viewOrderDetails(id: number): void {
    this.orderDetailsLoading.set(true);
    this.showOrderDetails.set(true);
    this.selectedOrder.set(null);
    this.selectedOrderLogistics.set(null);
    this.selectedOrderPayments.set([]);

    // Load order details
    this.traderService.getMyOrderDetails(id).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.selectedOrder.set(res.data);
        } else {
          this.notify(res?.message ?? 'فشل تحميل تفاصيل الطلب', true);
        }
        this.orderDetailsLoading.set(false);
      },
      error: () => {
        this.notify('فشل تحميل تفاصيل الطلب', true);
        this.orderDetailsLoading.set(false);
      },
    });

    // Load logistics
    this.traderService.getMyOrderLogistics(id).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.selectedOrderLogistics.set(res.data);
        }
      },
      error: () => {
        // Logistics might not exist yet, that's fine
      },
    });

    // Load payments
    this.traderService.getPayments(id).subscribe({
      next: (res) => {
        if (res && Array.isArray(res)) {
          this.selectedOrderPayments.set(res);
        }
      },
      error: () => {
        // Payments might not exist yet, that's fine
      },
    });
  }

  // ── Auctions ─────────────────────────────────────────────
  loadAuctions(): void {
    this.auctionsLoading.set(true);
    this.traderService.getMyWinningAuctions().subscribe({
      next: (res) => {
        if (res?.isSuccess) this.auctions.set(res.data);
        this.auctionsLoading.set(false);
      },
      error: () => this.auctionsLoading.set(false),
    });
  }

  // ── Helpers ──────────────────────────────────────────────
  getOrderStatus(status: string) {
    return ORDER_STATUS_MAP[status] ?? { label: status, bgClass: 'bg-gray-100', textClass: 'text-gray-500', icon: 'info' };
  }

  getPaymentStatus(status: string) {
    return PAYMENT_STATUS_MAP[status] ?? { label: status, bgClass: 'bg-gray-100', textClass: 'text-gray-500' };
  }

  getBusinessType(type: number): string {
    return BUSINESS_TYPES[type] || 'غير محدد';
  }

  getPaymentMethod(method: number): string {
    const methods: Record<number, string> = {
      0: 'غير محدد',
      1: 'بطاقة ائتمان',
      2: 'تحويل بنكي',
      3: 'محفظة رقمية',
      4: 'الدفع عند الاستلام',
    };
    return methods[method] || 'غير محدد';
  }

  formatPrice(price: number): string {
    if (!price && price !== 0) return '—';
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(price);
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatDateTime(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  private notify(msg: string, isError = false): void {
    this.snackBar.open(msg, 'إغلاق', {
      duration: 3000,
      panelClass: isError ? ['snack-error'] : ['snack-success'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  updateEditForm(field: string, value: any): void {
    this.editForm.update(f => ({ ...f, [field]: value }));
  }
}