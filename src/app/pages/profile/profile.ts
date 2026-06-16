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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { Auction, Product, ProfileService } from '../../core/services/profileSerivce/profile-service';

type ActiveTab = 'overview' | 'products' | 'orders' | 'auctions';

const ORDER_STATUS_MAP: Record<string, { label: string; bgClass: string; textClass: string; icon: string }> = {
  Pending:        { label: 'في الانتظار',   bgClass: 'bg-yellow-50', textClass: 'text-yellow-700', icon: 'hourglass_empty' },
  Confirmed:      { label: 'مؤكد',          bgClass: 'bg-blue-50',   textClass: 'text-blue-700',   icon: 'check'          },
  Preparing:      { label: 'قيد التحضير',   bgClass: 'bg-purple-50', textClass: 'text-purple-700', icon: 'inventory'      },
  ReadyForPickup: { label: 'جاهز للاستلام', bgClass: 'bg-cyan-50',   textClass: 'text-cyan-700',   icon: 'local_shipping' },
  Delivered:      { label: 'تم التوصيل',    bgClass: 'bg-green-50',  textClass: 'text-green-700',  icon: 'done_all'       },
  Cancelled:      { label: 'ملغي',          bgClass: 'bg-gray-100',  textClass: 'text-gray-500',   icon: 'cancel'         },
  Rejected:       { label: 'مرفوض',         bgClass: 'bg-red-50',    textClass: 'text-red-600',    icon: 'block'          },
};

const AUCTION_STATUS_MAP: Record<string, { label: string; bgClass: string; textClass: string; icon: string }> = {
  Active:   { label: 'جارٍ',  bgClass: 'bg-green-50', textClass: 'text-green-700', icon: 'play_circle' },
  Upcoming: { label: 'قادم',  bgClass: 'bg-blue-50',  textClass: 'text-blue-700',  icon: 'schedule'    },
  Ended:    { label: 'منتهي', bgClass: 'bg-red-50',   textClass: 'text-red-600',   icon: 'check_circle'},
  Canceled: { label: 'ملغي',  bgClass: 'bg-gray-100', textClass: 'text-gray-500',  icon: 'cancel'      },
};

const PRODUCT_STATUS_MAP: Record<number, { label: string; bgClass: string; textClass: string }> = {
  0: { label: 'مسودة',   bgClass: 'bg-gray-100',   textClass: 'text-gray-500'   },
  1: { label: 'نشط',     bgClass: 'bg-green-50',   textClass: 'text-green-700'  },
  3: { label: 'مؤرشف',   bgClass: 'bg-yellow-50',  textClass: 'text-yellow-700' },
  4: { label: 'محذوف',   bgClass: 'bg-red-50',     textClass: 'text-red-600'    },
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatTabsModule,
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile implements OnInit {
  private profileService = inject(ProfileService);
  private snackBar = inject(MatSnackBar);

  // ── Active Tab ──────────────────────────────────────────
  activeTab = signal<ActiveTab>('overview');

  // ── Profile ─────────────────────────────────────────────
  profile = signal<any>(null);
  profileLoading = signal(false);
  profileError = signal<string | null>(null);

  // Edit profile modal
  showEditModal = signal(false);
  editForm = signal<Record<string, string>>({
  name: '',
  farmName: '',
  description: ''
});
  editLoading = signal(false);

  // Profile image
  profileImageLoading = signal(false);

  // ── Products ─────────────────────────────────────────────
  products = signal<Product[]>([]);
  productsLoading = signal(false);
  productsTotal = signal(0);
  productsPageIndex = signal(0);
  productsPageSize = signal(8);
  productSearch = signal('');
  productStatusFilter = signal<number | null>(null);

  // Add/Edit product modal
  showProductModal = signal(false);
  productModalMode = signal<'add' | 'edit'>('add');
  productForm = signal<any>({
    id: null, name: '', description: '', categoryId: null,
    quantity: null, unit: 'كيلو', unitPrice: null,
    harvestDate: '', expiryDate: '',
  });
  productImages = signal<File[]>([]);
  productLoading = signal(false);
  categories = signal<any[]>([]);

  // Delete product confirm
  deleteProductId = signal<number | null>(null);
  deleteLoading = signal(false);

  // ── Orders ───────────────────────────────────────────────
  orders = signal<any[]>([]);
  ordersLoading = signal(false);
  rejectOrderId = signal<number | null>(null);
  rejectReason = signal('');
  orderActionLoading = signal(false);

  // ── Auctions ─────────────────────────────────────────────
  auctions = signal<Auction[]>([]);
  auctionsLoading = signal(false);

  // ── Computed ─────────────────────────────────────────────
  totalProducts = computed(() => this.profile()?.totalProducts ?? this.productsTotal());
  activeAuctions = computed(() => this.auctions().filter(a => a.status === 'Active').length);
  pendingOrders = computed(() => this.orders().filter(o => o.status === 'Pending').length);

  ngOnInit(): void {
    this.loadProfile();
    this.loadCategories();
  }

  // ── Tab Navigation ───────────────────────────────────────
  setTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
    if (tab === 'products' && this.products().length === 0) this.loadProducts();
    if (tab === 'orders' && this.orders().length === 0) this.loadOrders();
    if (tab === 'auctions' && this.auctions().length === 0) this.loadAuctions();
  }

  // ── Profile ─────────────────────────────────────────────
  loadProfile(): void {
    this.profileLoading.set(true);
    this.profileService.getMyProfileFarmer().subscribe({
      next: (res) => {
        if (res?.isSuccess) this.profile.set(res.data);
        else this.profileError.set(res?.message ?? 'خطأ في تحميل البروفايل');
        this.profileLoading.set(false);
      },
      error: (err) => { 
        console.log(err);
        
        this.profileError.set('تعذّر الاتصال بالخادم'); this.profileLoading.set(false); 
      },
    });
  }

  openEditModal(): void {
    const p = this.profile();
    this.editForm.set({ name: p?.name ?? '', farmName: p?.farmName ?? '', description: p?.description ?? '' });
    this.showEditModal.set(true);
  }

  saveProfile(): void {
    this.editLoading.set(true);
    const form = this.editForm();
    const isNew = !this.profile()?.farmerId;
    const req = isNew
      ? this.profileService.addMyProfileFarmer({ farmName: form['farmName'], description: form['description'] })
      : this.profileService.editMyProfileFarmer(form);

    req.subscribe({
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
    this.profileService.editProfileImage(formData).subscribe({
      next: (res) => {
        if (res?.isSuccess) { this.loadProfile(); this.notify('✅ تم تحديث الصورة'); }
        else this.notify(res?.message ?? 'فشل رفع الصورة', true);
        this.profileImageLoading.set(false);
      },
      error: () => { this.notify('فشل رفع الصورة', true); this.profileImageLoading.set(false); },
    });
  }

  // ── Products ─────────────────────────────────────────────
  loadProducts(): void {
    this.productsLoading.set(true);
    this.profileService.getMyProducts({
      pageIndex: this.productsPageIndex(),
      pageSize: this.productsPageSize(),
      search: this.productSearch() || undefined,
      status: this.productStatusFilter() ?? undefined,
    }).subscribe({
      next: (res) => {
        console.log(res);
        if (res?.isSuccess) {
          
          this.products.set(res.data.data);
          this.productsTotal.set(res.data.count);
        }
        this.productsLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        
        this.productsLoading.set(false)
      }
    });
  }

  loadCategories(): void {
    this.profileService.getCategories().subscribe({
      next: (res) => { if (res?.isSuccess) this.categories.set(res.data); },
    });
  }

  onProductsPage(event: PageEvent): void {
    this.productsPageIndex.set(event.pageIndex);
    this.productsPageSize.set(event.pageSize);
    this.loadProducts();
  }

  onProductSearch(): void {
    this.productsPageIndex.set(0);
    this.loadProducts();
  }

  openAddProduct(): void {
    this.productForm.set({ id: null, name: '', description: '', categoryId: null, quantity: null, unit: 'كيلو', unitPrice: null, harvestDate: '', expiryDate: '' });
    this.productImages.set([]);
    this.productModalMode.set('add');
    this.showProductModal.set(true);
  }

  openEditProduct(product: Product): void {
    this.productForm.set({
      id: product.id,
      name: product.name,
      description: product.description ?? '',
      categoryId: product.categoryId,
      quantity: product.quantity,
      unit: product.unit,
      unitPrice: product.unitPrice,
      harvestDate: product.harvestDate ? product.harvestDate.split('T')[0] : '',
      expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
    });
    this.productModalMode.set('edit');
    this.showProductModal.set(true);
  }

  onProductImagesChange(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    this.productImages.set(files);
  }

  saveProduct(): void {
    this.productLoading.set(true);
    const form = this.productForm();
    const isEdit = this.productModalMode() === 'edit';

    if (isEdit) {
      this.profileService.editProduct({ ...form }).subscribe({
        next: (res) => {
          if (res?.isSuccess) { this.loadProducts(); this.showProductModal.set(false); this.notify('✅ تم تعديل المنتج'); }
          else this.notify(res?.message ?? 'فشل التعديل', true);
          this.productLoading.set(false);
        },
        error: () => { this.notify('فشل التعديل', true); this.productLoading.set(false); },
      });
    } else {
      const formData = new FormData();
      formData.append('Name', form.name);
      formData.append('Description', form.description);
      formData.append('CategoryId', form.categoryId);
      formData.append('Quantity', form.quantity);
      formData.append('Unit', form.unit);
      formData.append('UnitPrice', form.unitPrice);
      if (form.harvestDate) formData.append('HarvestDate', new Date(form.harvestDate).toISOString());
      if (form.expiryDate) formData.append('ExpiryDate', new Date(form.expiryDate).toISOString());
      formData.append('PublishImmediately', 'true');
      this.productImages().forEach(f => formData.append('Images', f));
      this.profileService.addProduct(formData).subscribe({
        next: (res) => {
          if (res?.isSuccess) { this.loadProducts(); this.showProductModal.set(false); this.notify('✅ تم إضافة المنتج'); }
          else this.notify(res?.message ?? 'فشل الإضافة', true);
          this.productLoading.set(false);
        },
        error: () => { this.notify('فشل الإضافة', true); this.productLoading.set(false); },
      });
    }
  }

  confirmDeleteProduct(id: number): void { this.deleteProductId.set(id); }

  deleteProduct(): void {
    const id = this.deleteProductId();
    if (!id) return;
    this.deleteLoading.set(true);
    this.profileService.deleteProduct(id).subscribe({
      next: (res) => {
        if (res?.isSuccess) { this.loadProducts(); this.notify('✅ تم حذف المنتج'); }
        else this.notify(res?.message ?? 'فشل الحذف', true);
        this.deleteProductId.set(null);
        this.deleteLoading.set(false);
      },
      error: () => { this.notify('فشل الحذف', true); this.deleteLoading.set(false); },
    });
  }

  changeProductStatus(product: Product, status: number): void {
    this.profileService.changeProductStatus({ productId: product.id, productStatus: status }).subscribe({
      next: (res) => {
        if (res?.isSuccess) { this.loadProducts(); this.notify('✅ تم تغيير الحالة'); }
        else this.notify(res?.message ?? 'فشل', true);
      },
    });
  }

  // ── Orders ───────────────────────────────────────────────
  loadOrders(): void {
    this.ordersLoading.set(true);
    this.profileService.getMyOrdersFarmer().subscribe({
      next: (res) => {
        if (res?.isSuccess) this.orders.set(res.data);
        this.ordersLoading.set(false);
      },
      error: () => this.ordersLoading.set(false),
    });
  }

  confirmOrder(id: number): void {
    this.orderActionLoading.set(true);
    this.profileService.confirmOrder(id).subscribe({
      next: (res) => {
        if (res?.isSuccess) { this.loadOrders(); this.notify('✅ تم قبول الطلب'); }
        else this.notify(res?.message ?? 'فشل', true);
        this.orderActionLoading.set(false);
      },
      error: () => { this.notify('فشل', true); this.orderActionLoading.set(false); },
    });
  }

  openRejectModal(id: number): void { this.rejectOrderId.set(id); this.rejectReason.set(''); }

  submitReject(): void {
    const id = this.rejectOrderId();
    if (!id) return;
    this.orderActionLoading.set(true);
    this.profileService.rejectOrder(id, this.rejectReason()).subscribe({
      next: (res) => {
        if (res?.isSuccess) { this.loadOrders(); this.notify('تم رفض الطلب'); }
        else this.notify(res?.message ?? 'فشل', true);
        this.rejectOrderId.set(null);
        this.orderActionLoading.set(false);
      },
      error: () => { this.notify('فشل', true); this.orderActionLoading.set(false); },
    });
  }

  changeOrderStatus(orderId: number, status: number): void {
    this.profileService.changeStatus(orderId, status).subscribe({
      next: (res) => {
        if (res?.isSuccess) { this.loadOrders(); this.notify('✅ تم تحديث الحالة'); }
        else this.notify(res?.message ?? 'فشل', true);
      },
    });
  }

  // ── Auctions ─────────────────────────────────────────────
  loadAuctions(): void {
    this.auctionsLoading.set(true);
    this.profileService.getMyAuctions().subscribe({
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

  getAuctionStatus(status: string) {
    return AUCTION_STATUS_MAP[status] ?? { label: status, bgClass: 'bg-gray-100', textClass: 'text-gray-500', icon: 'info' };
  }

  getProductStatus(status: number) {
    return PRODUCT_STATUS_MAP[status] ?? { label: 'غير معروف', bgClass: 'bg-gray-100', textClass: 'text-gray-500' };
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(price);
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  private notify(msg: string, isError = false): void {
    this.snackBar.open(msg, 'إغلاق', {
      duration: 3000,
      panelClass: isError ? ['snack-error'] : ['snack-success'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  updateEditForm(field: string, value: string): void {
    this.editForm.update(f => ({ ...f, [field]: value }));
  }

  updateProductForm(field: string, value: any): void {
    this.productForm.update(f => ({ ...f, [field]: value }));
  }
}