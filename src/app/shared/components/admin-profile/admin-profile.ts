import { Component, computed, inject, signal } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AdminProfileService } from '../../../core/services/admin-profile/admin-profile-service';
import { ToastrService } from 'ngx-toastr';
import { MatFormField, MatLabel, MatOption, MatSelect } from "@angular/material/select";

type ActiveTab = 
  | 'overview' 
  | 'users' 
  | 'products' 
  | 'orders' 
  | 'auctions' 
  | 'categories' 
  | 'delivery' 
  | 'reviews' 
  | 'payments';

// ─── Status Maps ──────────────────────────────────────────────

const ORDER_STATUS_MAP: Record<string, { label: string; bgClass: string; textClass: string; icon: string }> = {
  Pending:        { label: 'في الانتظار',   bgClass: 'bg-yellow-50', textClass: 'text-yellow-700', icon: 'hourglass_empty' },
  Confirmed:      { label: 'مؤكد',          bgClass: 'bg-blue-50',   textClass: 'text-blue-700',   icon: 'check'          },
  Preparing:      { label: 'قيد التحضير',   bgClass: 'bg-purple-50', textClass: 'text-purple-700', icon: 'inventory'      },
  ReadyForPickup: { label: 'جاهز للاستلام', bgClass: 'bg-cyan-50',   textClass: 'text-cyan-700',   icon: 'local_shipping' },
  InDelivery:     { label: 'قيد التوصيل',   bgClass: 'bg-indigo-50', textClass: 'text-indigo-700', icon: 'local_shipping' },
  Delivered:      { label: 'تم التوصيل',    bgClass: 'bg-green-50',  textClass: 'text-green-700',  icon: 'done_all'       },
  Cancelled:      { label: 'ملغي',          bgClass: 'bg-gray-100',  textClass: 'text-gray-500',   icon: 'cancel'         },
  Rejected:       { label: 'مرفوض',         bgClass: 'bg-red-50',    textClass: 'text-red-600',    icon: 'block'          },
};

const AUCTION_STATUS_MAP: Record<string, { label: string; bgClass: string; textClass: string; icon: string }> = {
  Active:   { label: 'جارٍ',  bgClass: 'bg-green-50', textClass: 'text-green-700', icon: 'play_circle' },
  Upcoming: { label: 'قادم',  bgClass: 'bg-blue-50',  textClass: 'text-blue-700',  icon: 'schedule'    },
  Ended:    { label: 'منتهي', bgClass: 'bg-red-50',   textClass: 'text-red-600',   icon: 'check_circle' },
  Canceled: { label: 'ملغي',  bgClass: 'bg-gray-100', textClass: 'text-gray-500',  icon: 'cancel'      },
};

const PAYMENT_STATUS_MAP: Record<number, { label: string; bgClass: string; textClass: string }> = {
  0: { label: 'غير مدفوع', bgClass: 'bg-yellow-50', textClass: 'text-yellow-700' },
  1: { label: 'مدفوع',     bgClass: 'bg-green-50',  textClass: 'text-green-700' },
  2: { label: 'مسترد',     bgClass: 'bg-blue-50',   textClass: 'text-blue-700'  },
  3: { label: 'فاشل',      bgClass: 'bg-red-50',    textClass: 'text-red-600'   },
};

const PRODUCT_STATUS_MAP: Record<number, { label: string; bgClass: string; textClass: string }> = {
  0: { label: 'مسودة',     bgClass: 'bg-gray-100',   textClass: 'text-gray-500'   },
  1: { label: 'نشط',       bgClass: 'bg-green-50',   textClass: 'text-green-700'  },
  2: { label: 'نفد',       bgClass: 'bg-yellow-50',  textClass: 'text-yellow-700' },
  3: { label: 'مؤرشف',     bgClass: 'bg-gray-100',   textClass: 'text-gray-500'   },
  4: { label: 'محذوف',     bgClass: 'bg-red-50',     textClass: 'text-red-600'    },
  5: { label: 'مراجعة',    bgClass: 'bg-orange-50',  textClass: 'text-orange-600' },
};

const LOGISTICS_STATUS_MAP: Record<number, { label: string; bgClass: string; textClass: string }> = {
  0: { label: 'غير مجدول', bgClass: 'bg-gray-100', textClass: 'text-gray-500' },
  1: { label: 'مجددول',    bgClass: 'bg-blue-50',  textClass: 'text-blue-700' },
  2: { label: 'تم الاستلام', bgClass: 'bg-purple-50', textClass: 'text-purple-700' },
  3: { label: 'قيد النقل', bgClass: 'bg-indigo-50', textClass: 'text-indigo-700' },
  4: { label: 'تم التوصيل', bgClass: 'bg-green-50', textClass: 'text-green-700' },
  5: { label: 'فشل',       bgClass: 'bg-red-50',   textClass: 'text-red-600' },
};

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [MatProgressSpinner, MatIcon, FormsModule, MatPaginator, MatFormField, MatLabel, MatOption, MatSelect],
  templateUrl: './admin-profile.html',
  styleUrls: ['./admin-profile.scss'],
})
export class AdminProfile {
  private adminService = inject(AdminProfileService);
  private toastr = inject(ToastrService);

  // ═══════════════════════════════════════════════════════════════
  // 🏠 DASHBOARD
  // ═══════════════════════════════════════════════════════════════

  dashboard = signal<any>(null);
  dashboardLoading = signal(false);

  // ═══════════════════════════════════════════════════════════════
  // 👤 PROFILE
  // ═══════════════════════════════════════════════════════════════

  profile = signal<any>(null);
  profileLoading = signal(false);
  showEditModal = signal(false);
  editForm = signal({ name: '', email: '', userName: '' });
  editLoading = signal(false);
  profileImageLoading = signal(false);

  // ═══════════════════════════════════════════════════════════════
  // 👥 USERS
  // ═══════════════════════════════════════════════════════════════

  users = signal<any[]>([]);
  usersLoading = signal(false);
  usersTotal = signal(0);
  usersPageIndex = signal(0);
  usersPageSize = signal(10);
  userSearch = signal('');
  userRoleFilter = signal<string>('All');
  userStatusFilter = signal<string>('All');
  userVerifiedFilter = signal<string>('All');

  // Pending / Banned lists (for quick view)
  pendingFarmers = signal<any[]>([]);
  pendingTraders = signal<any[]>([]);
  bannedUsers = signal<any[]>([]);
  pendingListsLoading = signal(false);

  // User action modals
  showUserRoleModal = signal(false);
  selectedUserId = signal<string | null>(null);
  userRoleForm = signal({ userId: '', role: 'Farmer' });
  userRoleLoading = signal(false);

  // ═══════════════════════════════════════════════════════════════
  // 📦 PRODUCTS (Admin)
  // ═══════════════════════════════════════════════════════════════

  products = signal<any[]>([]);
  productsLoading = signal(false);
  productsTotal = signal(0);
  productsPageIndex = signal(0);
  productsPageSize = signal(8);
  productSearch = signal('');
  productCategoryFilter = signal<number | null>(null);
  productStatusFilter = signal<number | null>(null);
  categories = signal<any[]>([]);

  // Product status change modal
  showProductStatusModal = signal(false);
  selectedProductForStatus = signal<any>(null);
  productStatusForm = signal({ productId: 0, productStatus: 1 });
  productStatusLoading = signal(false);

  // Delete product confirm
  deleteProductId = signal<number | null>(null);
  deleteLoading = signal(false);

  // ═══════════════════════════════════════════════════════════════
  // 📋 ORDERS (Admin)
  // ═══════════════════════════════════════════════════════════════

  orders = signal<any[]>([]);
  ordersLoading = signal(false);
  ordersTotal = signal(0);
  ordersPageIndex = signal(0);
  ordersPageSize = signal(10);
  orderStatusFilter = signal<string>('All');
  orderPaymentFilter = signal<string>('All');

  // Order details modal
  showOrderDetailsModal = signal(false);
  selectedOrderId = signal<number | null>(null);
  selectedOrderDetails = signal<any>(null);
  selectedOrderPayments = signal<any[]>([]);
  selectedOrderLogistics = signal<any>(null);
  orderDetailsLoading = signal(false);

  // Order action
  orderActionLoading = signal(false);
  rejectOrderId = signal<number | null>(null);
  rejectReason = signal('');
  cancelOrderId = signal<number | null>(null);
  cancelOrderLoading = signal(false);

  // ═══════════════════════════════════════════════════════════════
  // 💳 PAYMENTS
  // ═══════════════════════════════════════════════════════════════

  payments = signal<any[]>([]);
  paymentsLoading = signal(false);
  showPaymentStatusModal = signal(false);
  selectedPaymentOrderId = signal<number | null>(null);
  paymentStatusForm = signal({ status: 1 });
  paymentStatusLoading = signal(false);

  // ═══════════════════════════════════════════════════════════════
  // 🏆 AUCTIONS (Admin)
  // ═══════════════════════════════════════════════════════════════

  auctions = signal<any[]>([]);
  auctionsLoading = signal(false);
  auctionsTotal = signal(0);
  auctionsPageIndex = signal(0);
  auctionsPageSize = signal(8);
  auctionStatusFilter = signal<string>('All');
  deleteAuctionId = signal<number | null>(null);
  deleteAuctionLoading = signal(false);

  // ═══════════════════════════════════════════════════════════════
  // 📂 CATEGORIES
  // ═══════════════════════════════════════════════════════════════

  showCategoryModal = signal(false);
  categoryModalMode = signal<'add' | 'edit'>('add');
  categoryForm = signal({ id: 0, name: '', nameAr: '' });
  categoryLoading = signal(false);

  // ═══════════════════════════════════════════════════════════════
  // 🚚 DELIVERY METHODS
  // ═══════════════════════════════════════════════════════════════

  deliveryMethods = signal<any[]>([]);
  deliveryLoading = signal(false);
  showDeliveryModal = signal(false);
  deliveryModalMode = signal<'add' | 'edit'>('add');
  deliveryForm = signal({
    id: 0,
    shortName: '',
    description: '',
    cost: 0,
    deliveryTime: '',
  });
  deliverySubmitLoading = signal(false);
  deleteDeliveryId = signal<number | null>(null);
  deleteDeliveryLoading = signal(false);

  // ═══════════════════════════════════════════════════════════════
  // ⭐ REVIEWS
  // ═══════════════════════════════════════════════════════════════

  pendingReviews = signal<any[]>([]);
  reviewsLoading = signal(false);
  reviewActionLoading = signal(false);

  // ═══════════════════════════════════════════════════════════════
  // 🧭 ACTIVE TAB
  // ═══════════════════════════════════════════════════════════════

  activeTab = signal<ActiveTab>('overview');

  // ─── Computed ──────────────────────────────────────────────────

  pendingVerifications = computed(() => this.dashboard()?.pendingVerifications ?? 0);
  pendingReviewsCount = computed(() => this.dashboard()?.pendingReviews ?? 0);

  // ═══════════════════════════════════════════════════════════════
  // 🚀 LIFECYCLE
  // ═══════════════════════════════════════════════════════════════

  ngOnInit(): void {
    this.loadProfile();
    this.loadDashboard();
    this.loadCategories();
  }

  // ═══════════════════════════════════════════════════════════════
  // 📌 TAB NAVIGATION
  // ═══════════════════════════════════════════════════════════════

  setTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
    switch (tab) {
      case 'overview':
        this.loadDashboard();
        break;
      case 'users':
        this.loadUsers();
        this.loadPendingLists();
        break;
      case 'products':
        this.loadProducts();
        break;
      case 'orders':
        this.loadOrders();
        break;
      case 'auctions':
        this.loadAuctions();
        break;
      case 'payments':
        this.loadPayments();
        break;
      case 'categories':
        this.loadCategories();
        break;
      case 'delivery':
        this.loadDeliveryMethods();
        break;
      case 'reviews':
        this.loadPendingReviews();
        break;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🏠 DASHBOARD
  // ═══════════════════════════════════════════════════════════════

  loadDashboard(): void {
    if (this.dashboardLoading()) return;
    this.dashboardLoading.set(true);
    this.adminService.getDashboardReports().subscribe({
      next: (res) => {
        if (res?.isSuccess) this.dashboard.set(res.data);
        this.dashboardLoading.set(false);
      },
      error: () => this.dashboardLoading.set(false),
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 👤 PROFILE
  // ═══════════════════════════════════════════════════════════════

  loadProfile(): void {
    this.profileLoading.set(true);
    this.adminService.getMyProfile().subscribe({
      next: (res) => {
        if (res?.isSuccess) this.profile.set(res.data);
        this.profileLoading.set(false);
      },
      error: () => this.profileLoading.set(false),
    });
  }

  openEditModal(): void {
    const p = this.profile();
    this.editForm.set({
      name: p?.name ?? '',
      email: p?.email ?? '',
      userName: p?.userName ?? '',
    });
    this.showEditModal.set(true);
  }

  saveProfile(): void {
    this.editLoading.set(true);
    this.adminService.updateMyProfile(this.editForm()).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          console.log(res);
          
          this.profile.set(res.data);
          this.showEditModal.set(false);
          this.toastr.success('تم حفظ البروفايل', 'نجاح');
        } 
        this.editLoading.set(false);
      },
      error: () => {
        this.toastr.error('فشل الحفظ', 'خطأ');
        this.editLoading.set(false);
      },
    });
  }

  onProfileImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.profileImageLoading.set(true);
    const formData = new FormData();
    formData.append('Image', file);

    this.adminService.updateUserImage(formData).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.loadProfile();
          this.toastr.success('تم تحديث الصورة', 'نجاح');
        } 
        this.profileImageLoading.set(false);
        input.value = '';
      },
      error: () => {
        this.toastr.error('فشل رفع الصورة', 'خطأ');
        this.profileImageLoading.set(false);
        input.value = '';
      },
    });
  }

  updateEditForm(field: string, value: string): void {
    this.editForm.update((f) => ({ ...f, [field]: value }));
  }

  // ═══════════════════════════════════════════════════════════════
  // 👥 USERS
  // ═══════════════════════════════════════════════════════════════

  loadUsers(): void {
    if (this.usersLoading()) return;
    this.usersLoading.set(true);

    const params: any = {
      pageNumber: this.usersPageIndex() + 1,
      pageSize: this.usersPageSize(),
    };
    if (this.userSearch()) params.searchTerm = this.userSearch();
    if (this.userRoleFilter() !== 'All') params.role = this.userRoleFilter();
    if (this.userStatusFilter() !== 'All')
      params.isActive = this.userStatusFilter() === 'Active';
    if (this.userVerifiedFilter() !== 'All')
      params.isVerified = this.userVerifiedFilter() === 'Verified';

    this.adminService.getUsers(params).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          console.log(res);
          
          this.users.set(res.data.data);
          this.usersTotal.set(res.data.count);
        }
        this.usersLoading.set(false);
      },
      error: () => this.usersLoading.set(false),
    });
  }

  loadPendingLists(): void {
    if (this.pendingListsLoading()) return;
    this.pendingListsLoading.set(true);

    // Load all three in parallel
    this.adminService.getPendingFarmers().subscribe({
      next: (res) => {
        if (res?.isSuccess) this.pendingFarmers.set(res.data);
      },
    });
    this.adminService.getPendingTraders().subscribe({
      next: (res) => {
        if (res?.isSuccess) this.pendingTraders.set(res.data);
      },
    });
    this.adminService.getBannedUsers().subscribe({
      next: (res) => {
        if (res?.isSuccess) this.bannedUsers.set(res.data);
      },
      complete: () => this.pendingListsLoading.set(false),
    });
  }

  onUsersPage(event: PageEvent): void {
    this.usersPageIndex.set(event.pageIndex);
    this.usersPageSize.set(event.pageSize);
    this.loadUsers();
  }

  onUserSearch(): void {
    this.usersPageIndex.set(0);
    this.loadUsers();
  }

  toggleUserStatus(userId: string): void {
    this.adminService.toggleUserStatus(userId).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.loadUsers();
          this.loadPendingLists();
          this.toastr.success('تم تغيير حالة المستخدم', 'نجاح');
        }
      },
      error: () => this.toastr.error('فشل', 'خطأ'),
    });
  }

  verifyFarmer(userId: string): void {
    this.adminService.verifyFarmer(userId).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.loadUsers();
          this.loadPendingLists();
          this.toastr.success('تم توثيق المزارع', 'نجاح');
        } 
      },
      error: () => this.toastr.error('فشل', 'خطأ'),
    });
  }

  verifyTrader(userId: string): void {
    this.adminService.verifyTrader(userId).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.loadUsers();
          this.loadPendingLists();
          this.toastr.success('تم توثيق التاجر', 'نجاح');
        } 
      },
      error: () => this.toastr.error('فشل', 'خطأ'),
    });
  }

  // ─── Role Modal ───────────────────────────────────────────────

  openRoleModal(userId: string): void {
    this.selectedUserId.set(userId);
    this.userRoleForm.set({ userId, role: 'Farmer' });
    this.showUserRoleModal.set(true);
  }

  saveRole(): void {
    this.userRoleLoading.set(true);
    this.adminService.addRole(this.userRoleForm()).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.showUserRoleModal.set(false);
          this.loadUsers();
          this.toastr.success('تم إضافة الدور', 'نجاح');
        }
        this.userRoleLoading.set(false);
      },
      error: () => {
        this.toastr.error('فشل', 'خطأ');
        this.userRoleLoading.set(false);
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 📦 PRODUCTS (Admin)
  // ═══════════════════════════════════════════════════════════════

  loadProducts(): void {
    if (this.productsLoading()) return;
    this.productsLoading.set(true);

    const params: any = {
      pageIndex: this.productsPageIndex(),
      pageSize: this.productsPageSize(),
    };
    if (this.productSearch()) params.search = this.productSearch();
    if (this.productCategoryFilter()) params.categoryId = this.productCategoryFilter();
    if (this.productStatusFilter() !== null && this.productStatusFilter() !== -1)
      params.status = this.productStatusFilter();

    this.adminService.getProducts(params).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          console.log(res);
          
          this.products.set(res.data.data);
          this.productsTotal.set(res.data.count);
        }
        this.productsLoading.set(false);
      },
      error: () => this.productsLoading.set(false),
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

  loadCategories(): void {
    this.adminService.getCategories().subscribe({
      next: (res) => {
        if (res?.isSuccess) this.categories.set(res.data);
      },
    });
  }

  // ─── Product Status Change ────────────────────────────────────

  openProductStatusModal(product: any): void {
    this.selectedProductForStatus.set(product);
    this.productStatusForm.set({
      productId: product.id,
      productStatus: this.getProductStatusNumber(product.status),
    });
    this.showProductStatusModal.set(true);
  }

  saveProductStatus(): void {
    this.productStatusLoading.set(true);
    this.adminService
      .changeStatusProduct(this.productStatusForm())
      .subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            this.showProductStatusModal.set(false);
            this.loadProducts();
            this.toastr.success('تم تغيير حالة المنتج', 'نجاح');
          }
          this.productStatusLoading.set(false);
        },
        error: () => {
          this.toastr.error('فشل', 'خطأ');
          this.productStatusLoading.set(false);
        },
      });
  }

  toggleReviewProduct(productId: number): void {
    this.adminService.reviewProduct(productId).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.loadProducts();
          this.toastr.success('تم تغيير حالة المراجعة', 'نجاح');
        }
      },
      error: () => this.toastr.error('فشل', 'خطأ'),
    });
  }

  confirmDeleteProduct(id: number): void {
    this.deleteProductId.set(id);
  }

  deleteProduct(): void {
    const id = this.deleteProductId();
    if (!id) return;

    this.deleteLoading.set(true);
    this.adminService.deleteProduct(id).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.loadProducts();
          this.toastr.success('تم حذف المنتج', 'نجاح');
        } 
        this.deleteProductId.set(null);
        this.deleteLoading.set(false);
      },
      error: () => {
        this.toastr.error('فشل الحذف', 'خطأ');
        this.deleteProductId.set(null);
        this.deleteLoading.set(false);
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 📋 ORDERS (Admin)
  // ═══════════════════════════════════════════════════════════════

  loadOrders(): void {
    if (this.ordersLoading()) return;
    this.ordersLoading.set(true);

    const params: any = {
      pageIndex: this.ordersPageIndex(),
      pageSize: this.ordersPageSize(),
    };
    if (this.orderStatusFilter() !== 'All') params.orderStatus = this.orderStatusFilter();
    if (this.orderPaymentFilter() !== 'All') params.paymentStatus = this.orderPaymentFilter();

    this.adminService.getAdminOrders(params).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.orders.set(res.data.data);
          this.ordersTotal.set(res.data.count);
        }
        this.ordersLoading.set(false);
      },
      error: () => this.ordersLoading.set(false),
    });
  }

  onOrdersPage(event: PageEvent): void {
    this.ordersPageIndex.set(event.pageIndex);
    this.ordersPageSize.set(event.pageSize);
    this.loadOrders();
  }

  viewOrderDetails(orderId: number): void {
    this.orderDetailsLoading.set(true);
    this.showOrderDetailsModal.set(true);
    this.selectedOrderId.set(orderId);

    this.adminService.getAdminOrderDetails(orderId).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.selectedOrderDetails.set(res.data);
          // Load payments
          this.adminService.getPaymentByOrder(orderId).subscribe({
            next: (payRes) => {
              this.selectedOrderPayments.set(Array.isArray(payRes) ? payRes : (payRes?.data ?? []));
            },
          });
          // Load logistics
          this.adminService.getOrderLogistics(orderId).subscribe({
            next: (logRes) => {
              this.selectedOrderLogistics.set(logRes?.data ?? null);
            },
          });
        } 
        this.orderDetailsLoading.set(false);
      },
      error: () => {
        this.toastr.error('فشل تحميل التفاصيل', 'خطأ');
        this.orderDetailsLoading.set(false);
      },
    });
  }

  closeOrderDetails(): void {
    this.showOrderDetailsModal.set(false);
    this.selectedOrderId.set(null);
    this.selectedOrderDetails.set(null);
    this.selectedOrderPayments.set([]);
    this.selectedOrderLogistics.set(null);
  }

  changeOrderStatus(orderId: number, status: number): void {
    this.orderActionLoading.set(true);
    this.adminService.changeOrderStatus(orderId, status).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.loadOrders();
          this.toastr.success('تم تغيير حالة الطلب', 'نجاح');
        }
        this.orderActionLoading.set(false);
      },
      error: () => {
        this.toastr.error('فشل', 'خطأ');
        this.orderActionLoading.set(false);
      },
    });
  }

  openCancelOrder(orderId: number): void {
    this.cancelOrderId.set(orderId);
  }

  confirmCancelOrder(): void {
    const orderId = this.cancelOrderId();
    if (!orderId) return;

    this.cancelOrderLoading.set(true);
    this.adminService.cancelOrder(orderId).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.loadOrders();
          this.toastr.success('تم إلغاء الطلب', 'نجاح');
        }
        this.cancelOrderId.set(null);
        this.cancelOrderLoading.set(false);
      },
      error: () => {
        this.toastr.error('فشل', 'خطأ');
        this.cancelOrderId.set(null);
        this.cancelOrderLoading.set(false);
      },
    });
  }

  changeLogisticsStatus(orderId: number, status: number): void {
    this.orderActionLoading.set(true);
    this.adminService.changeStatusLogistics(orderId, status).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.loadOrders();
          this.toastr.success('تم تغيير حالة اللوجستكس', 'نجاح');
        }
        this.orderActionLoading.set(false);
      },
      error: () => {
        this.toastr.error('فشل', 'خطأ');
        this.orderActionLoading.set(false);
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 💳 PAYMENTS
  // ═══════════════════════════════════════════════════════════════

  loadPayments(): void {
    if (this.paymentsLoading()) return;
    this.paymentsLoading.set(true);

    this.adminService.getAllPayments().subscribe({
      next: (res) => {
        console.log(res);
        this.payments.set(Array.isArray(res) ? res : (res?.data ?? []));
        this.paymentsLoading.set(false);
      },
      error: () => this.paymentsLoading.set(false),
    });
  }

  openPaymentStatusModal(orderId: number): void {
    this.selectedPaymentOrderId.set(orderId);
    this.paymentStatusForm.set({ status: 1 });
    this.showPaymentStatusModal.set(true);
  }

  savePaymentStatus(): void {
    const orderId = this.selectedPaymentOrderId();
    if (!orderId) return;

    this.paymentStatusLoading.set(true);
    this.adminService
      .changeStatusPayment(orderId, this.paymentStatusForm().status)
      .subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            this.showPaymentStatusModal.set(false);
            this.loadPayments();
            this.loadOrders();
            this.toastr.success('تم تغيير حالة الدفع', 'نجاح');
          }
          this.paymentStatusLoading.set(false);
        },
        error: () => {
          this.toastr.error('فشل', 'خطأ');
          this.paymentStatusLoading.set(false);
        },
      });
  }

  // ═══════════════════════════════════════════════════════════════
  // 🏆 AUCTIONS (Admin)
  // ═══════════════════════════════════════════════════════════════

  loadAuctions(): void {
    if (this.auctionsLoading()) return;
    this.auctionsLoading.set(true);

    const params: any = {
      pageIndex: this.auctionsPageIndex(),
      pageSize: this.auctionsPageSize(),
    };
    if (this.auctionStatusFilter() !== 'All') {
      const statusMap: Record<string, number> = {
        Active: 1,
        Upcoming: 0,
        Ended: 2,
        Canceled: 3,
      };
      params.status = statusMap[this.auctionStatusFilter()] ?? 1;
    }

    this.adminService.getAllAuctions(params).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.auctions.set(res.data.data);
          this.auctionsTotal.set(res.data.count);
        }
        this.auctionsLoading.set(false);
      },
      error: () => this.auctionsLoading.set(false),
    });
  }

  onAuctionsPage(event: PageEvent): void {
    this.auctionsPageIndex.set(event.pageIndex);
    this.auctionsPageSize.set(event.pageSize);
    this.loadAuctions();
  }

  confirmDeleteAuction(id: number): void {
    this.deleteAuctionId.set(id);
  }

  deleteAuction(): void {
    const id = this.deleteAuctionId();
    if (!id) return;

    this.deleteAuctionLoading.set(true);
    this.adminService.deleteAuction(id).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.loadAuctions();
          this.toastr.success('تم حذف المزاد', 'نجاح');
        } 
        this.deleteAuctionId.set(null);
        this.deleteAuctionLoading.set(false);
      },
      error: () => {
        this.toastr.error('فشل الحذف', 'خطأ');
        this.deleteAuctionId.set(null);
        this.deleteAuctionLoading.set(false);
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 📂 CATEGORIES
  // ═══════════════════════════════════════════════════════════════

  openAddCategory(): void {
    this.categoryForm.set({ id: 0, name: '', nameAr: '' });
    this.categoryModalMode.set('add');
    this.showCategoryModal.set(true);
  }

  openEditCategory(category: any): void {
    this.categoryForm.set({
      id: category.id,
      name: category.name,
      nameAr: category.nameAr,
    });
    this.categoryModalMode.set('edit');
    this.showCategoryModal.set(true);
  }

  saveCategory(): void {
    this.categoryLoading.set(true);
    const form = this.categoryForm();
    const isEdit = this.categoryModalMode() === 'edit';

    const req = isEdit
      ? this.adminService.updateCategory({ name: form.name, nameAr: form.nameAr }, form.id)
      : this.adminService.createCategory({ name: form.name, nameAr: form.nameAr });

    req.subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.showCategoryModal.set(false);
          this.loadCategories();
          this.toastr.success(isEdit ? 'تم تعديل الفئة' : 'تم إضافة الفئة', 'نجاح');
        }
        this.categoryLoading.set(false);
      },
      error: () => {
        this.toastr.error('فشل', 'خطأ');
        this.categoryLoading.set(false);
      },
    });
  }


  // ═══════════════════════════════════════════════════════════════
  // 🚚 DELIVERY METHODS
  // ═══════════════════════════════════════════════════════════════

  loadDeliveryMethods(): void {
    if (this.deliveryLoading()) return;
    this.deliveryLoading.set(true);
    this.adminService.getDeliveryMethods().subscribe({
      next: (res) => {
        if (res?.isSuccess) this.deliveryMethods.set(res.data);
        this.deliveryLoading.set(false);
      },
      error: () => this.deliveryLoading.set(false),
    });
  }

  openAddDelivery(): void {
    this.deliveryForm.set({ id: 0, shortName: '', description: '', cost: 0, deliveryTime: '' });
    this.deliveryModalMode.set('add');
    this.showDeliveryModal.set(true);
  }

  openEditDelivery(method: any): void {
    this.deliveryForm.set({
      id: method.id,
      shortName: method.shortName,
      description: method.description,
      cost: method.cost,
      deliveryTime: method.deliveryTime,
    });
    this.deliveryModalMode.set('edit');
    this.showDeliveryModal.set(true);
  }

  saveDelivery(): void {
    this.deliverySubmitLoading.set(true);
    const form = this.deliveryForm();
    const isEdit = this.deliveryModalMode() === 'edit';

    const req = isEdit
      ? this.adminService.updateDeliveryMethods(form.id, {
          shortName: form.shortName,
          description: form.description,
          cost: form.cost,
          deliveryTime: form.deliveryTime,
        })
      : this.adminService.createDeliveryMethods({
          shortName: form.shortName,
          description: form.description,
          cost: form.cost,
          deliveryTime: form.deliveryTime,
        });

    req.subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.showDeliveryModal.set(false);
          this.loadDeliveryMethods();
          this.toastr.success(
            isEdit ? 'تم تعديل طريقة التوصيل' : 'تم إضافة طريقة التوصيل',
            'نجاح'
          );
        }
        this.deliverySubmitLoading.set(false);
      },
      error: () => {
        this.toastr.error('فشل', 'خطأ');
        this.deliverySubmitLoading.set(false);
      },
    });
  }

  confirmDeleteDelivery(id: number): void {
    if (confirm('هل أنت متأكد من حذف طريقة التوصيل؟')) {
      this.deleteDeliveryLoading.set(true);
      this.adminService.deleteDeliveryMethods(id).subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            this.loadDeliveryMethods();
            this.toastr.success('تم حذف طريقة التوصيل', 'نجاح');
          } 
          this.deleteDeliveryLoading.set(false);
        },
        error: () => {
          this.toastr.error('فشل الحذف', 'خطأ');
          this.deleteDeliveryLoading.set(false);
        },
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // ⭐ REVIEWS
  // ═══════════════════════════════════════════════════════════════

  loadPendingReviews(): void {
    if (this.reviewsLoading()) return;
    this.reviewsLoading.set(true);
    this.adminService.getPendingReview().subscribe({
      next: (res) => {
        if (res?.isSuccess) this.pendingReviews.set(res.data);
        this.reviewsLoading.set(false);
      },
      error: () => this.reviewsLoading.set(false),
    });
  }

  approveReview(reviewId: number): void {
    this.reviewActionLoading.set(true);
    this.adminService.approveReview(reviewId).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.loadPendingReviews();
          this.toastr.success('تم قبول المراجعة', 'نجاح');
        }
        this.reviewActionLoading.set(false);
      },
      error: () => {
        this.toastr.error('فشل', 'خطأ');
        this.reviewActionLoading.set(false);
      },
    });
  }

  deleteReview(reviewId: number): void {
    if (!confirm('هل أنت متأكد من حذف هذه المراجعة؟')) return;
    this.reviewActionLoading.set(true);
    this.adminService.deleteReview(reviewId).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.loadPendingReviews();
          this.toastr.success('تم حذف المراجعة', 'نجاح');
        }
        this.reviewActionLoading.set(false);
      },
      error: () => {
        this.toastr.error('فشل', 'خطأ');
        this.reviewActionLoading.set(false);
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 🛠 HELPERS
  // ═══════════════════════════════════════════════════════════════

  getOrderStatus(status: string) {
    return ORDER_STATUS_MAP[status] ?? { label: status, bgClass: 'bg-gray-100', textClass: 'text-gray-500', icon: 'info' };
  }

  getAuctionStatus(status: string) {
    return AUCTION_STATUS_MAP[status] ?? { label: status, bgClass: 'bg-gray-100', textClass: 'text-gray-500', icon: 'info' };
  }

  getProductStatus(status: number | string) {
    if (typeof status === 'string') {
      const map: Record<string, number> = {
        Draft: 0,
        Active: 1,
        SoldOut: 2,
        Archived: 3,
        Deleted: 4,
        UnderReview: 5,
      };
      status = map[status] ?? 0;
    }
    return PRODUCT_STATUS_MAP[status as number] ?? { label: 'غير معروف', bgClass: 'bg-gray-100', textClass: 'text-gray-500' };
  }

  getProductStatusNumber(status: string | number): number {
    if (typeof status === 'string') {
      const map: Record<string, number> = {
        Draft: 0,
        Active: 1,
        SoldOut: 2,
        Archived: 3,
        Deleted: 4,
        UnderReview: 5,
      };
      return map[status] ?? 0;
    }
    return status;
  }

  getPaymentStatus(status: number) {
    return PAYMENT_STATUS_MAP[status] ?? { label: 'غير معروف', bgClass: 'bg-gray-100', textClass: 'text-gray-500' };
  }

  getLogisticsStatus(status: number) {
    return LOGISTICS_STATUS_MAP[status] ?? { label: 'غير معروف', bgClass: 'bg-gray-100', textClass: 'text-gray-500' };
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatDateTime(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  

}