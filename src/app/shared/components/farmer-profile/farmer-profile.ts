// profile-page.component.ts
import { Component, computed, inject, signal } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatSelect, MatOption } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../../../core/services/profileSerivce/profile-service';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatIcon } from "@angular/material/icon";
import { FormsModule } from '@angular/forms';
import { FarmerProfileService } from '../../../core/services/farmer-profile/farmer-profile-service';
import { NgClass } from '@angular/common';

type ActiveTab = 'overview' | 'products' | 'orders' | 'auctions';

const ORDER_STATUS_MAP: Record<string, { label: string; bgClass: string; textClass: string; icon: string }> = {
  Pending:        { label: 'في الانتظار',   bgClass: 'bg-yellow-50', textClass: 'text-yellow-700', icon: 'hourglass_empty' },
  Confirmed:      { label: 'مؤكد',          bgClass: 'bg-blue-50',   textClass: 'text-blue-700',   icon: 'check'          },
  Preparing:      { label: 'قيد التحضير',   bgClass: 'bg-purple-50', textClass: 'text-purple-700', icon: 'inventory'      },
  ReadyForPickup: { label: 'جاهز للاستلام', bgClass: 'bg-cyan-50',   textClass: 'text-cyan-700',   icon: 'local_shipping' },
  InDelivery:     { label: 'قيد التوصيل',      bgClass: 'bg-orange-50', textClass: 'text-orange-700', icon: 'local_shipping' },
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
  selector: 'app-farmer-profile',
  imports: [
    MatProgressSpinner, 
    MatIcon, 
    FormsModule, 
    MatPaginator, 
    MatSelect, 
    MatOption,
    NgClass
  ],
  templateUrl: './farmer-profile.html',
  styleUrl: './farmer-profile.scss',
})
export class FarmerProfile {
  private profileService = inject(FarmerProfileService);
  private toastr = inject(ToastrService);

  // ── Active Tab ──────────────────────────────────────────
  activeTab = signal<ActiveTab>('overview');

  // ── Profile ─────────────────────────────────────────────
  profile = signal<any>(null);
  profileLoading = signal(false);
  profileError = signal<string | null>(null);
  selectedOrder = signal<any>(null);
  // Computed profile values
  joinDateFormatted = computed(() => {
    const p = this.profile();
    return p?.joinDate ? this.formatDate(p.joinDate) : '';
  });

  // Edit profile modal
  showEditModal = signal(false);
  editForm = signal({ name: '', farmName: '', description: '' });
  editLoading = signal(false);

  // Profile image
  profileImageLoading = signal(false);

  // ── Products ─────────────────────────────────────────────
  products = signal<any[]>([]);
  productsLoading = signal(false);
  productsTotal = signal(0);
  productsPageIndex = signal(0);
  productsPageSize = signal(8);
  productSearch = signal('');

  // ── Delivery Method ──────────────────────────────────────
  deliveryMethod = signal<any>(null);
  deliveryMethodLoading = signal(false);

  // ── Product Images Management ────────────────────────────
  addingProductImage = signal(false);
  deletingImageId = signal<string | null>(null);

  // Product details modal
  selectedProduct = signal<any>(null);
  showProductDetailsModal = signal(false);
  productDetailsLoading = signal(false);

  // Add/Edit product modal
  showProductModal = signal(false);
  productModalMode = signal<'add' | 'edit'>('add');
  productForm = signal<any>({
    id: null, 
    name: '', 
    description: '', 
    categoryId: null,
    quantity: null, 
    unit: 'كيلو', 
    unitPrice: null,
    harvestDate: '', 
    expiryDate: '',
  });
  productImages = signal<File[]>([]);
  productImagePreviews = signal<string[]>([]);
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

  // Order details
  selectedOrderId = signal<number | null>(null);
  selectedOrderPayments = signal<any[]>([]);
  showOrderDetailsModal = signal(false);
  orderDetailsLoading = signal(false);

  // Cancel order
  cancelOrderId = signal<number | null>(null);
  cancelOrderLoading = signal(false);

  // ── Auctions ─────────────────────────────────────────────
  auctions = signal<any[]>([]);
  auctionsLoading = signal(false);

  // Create auction modal
  showCreateAuctionModal = signal(false);
  auctionForm = signal({
    productId: null as number | null,
    startDate: '',
    endDate: '',
    startingPrice: null as number | null,
    reservePrice: null as number | null,
  });
  auctionLoading = signal(false);

  // ── Computed ─────────────────────────────────────────────
  totalProducts = computed(() => this.profile()?.totalProducts ?? this.productsTotal());
  activeAuctions = computed(() => this.auctions().filter(a => a.status === 'Active').length);
  pendingOrders = computed(() => this.orders().filter(o => o.status === 'Pending').length);

  // ── Lifecycle ────────────────────────────────────────────
  ngOnInit(): void {
    this.loadProfile();
    this.loadCategories();
  }

  // ── Tab Navigation ───────────────────────────────────────
  setTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
    
    // Load data only when user clicks the tab
    if (tab === 'products' && this.products().length === 0 && !this.productsLoading()) {
      this.loadProducts();
    } else if (tab === 'orders' && this.orders().length === 0 && !this.ordersLoading()) {
      this.loadOrders();
    } else if (tab === 'auctions' && this.auctions().length === 0 && !this.auctionsLoading()) {
      this.loadAuctions();
    }
  }

  // ── Profile ─────────────────────────────────────────────
  loadProfile(): void {
    this.profileLoading.set(true);
    this.profileService.getMyProfileFarmer().subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.profile.set(res.data);
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
      name: p?.name ?? '', 
      farmName: p?.farmName ?? '', 
      description: p?.description ?? '' 
    });
    this.showEditModal.set(true);
  }

  saveProfile(): void {
    this.editLoading.set(true);
    const form = this.editForm();
    const profile = this.profile();
    const isNew = !profile?.farmerId;
    
    const req = isNew
      ? this.profileService.addMyProfileFarmer({ 
          farmName: form.farmName, 
          description: form.description 
        })
      : this.profileService.editMyProfileFarmer({
          name: form.name,
          farmName: form.farmName, 
          description: form.description 
        });

    req.subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.profile.set(res.data);
          this.showEditModal.set(false);
          this.toastr.success('تم حفظ البروفايل بنجاح', ' نجاح');
        } else {
          this.toastr.error(res?.message ?? 'حدث خطأ', 'خطأ');
        }
        this.editLoading.set(false);
      },
      error: () => { 
        this.toastr.error('تعذّر الحفظ', 'خطأ'); 
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
    
    this.profileService.editProfileImage(formData).subscribe({
      next: (res) => {
        if (res?.isSuccess) { 
          this.loadProfile(); 
          this.toastr.success('تم تحديث الصورة', ' نجاح'); 
        } else {
          this.toastr.error(res?.message ?? 'فشل رفع الصورة', 'خطأ');
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
    this.editForm.update(f => ({ ...f, [field]: value }));
  }

  // ── Products ─────────────────────────────────────────────
  loadProducts(): void {
    this.productsLoading.set(true);
    const params: any = {
      pageIndex: this.productsPageIndex(),
      pageSize: this.productsPageSize(),
    };
    if (this.productSearch()) {
      params.search = this.productSearch();
    }
    

    this.profileService.getMyProducts(params).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.products.set(res.data.data);
          this.productsTotal.set(res.data.count);
        }
        this.productsLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.productsLoading.set(false);
      },
    });
  }

  loadCategories(): void {
    this.profileService.getCategories().subscribe({
      next: (res) => { 
        if (res?.isSuccess) {
          this.categories.set(res.data);
        }
      },
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

  viewProductDetails(productId: number): void {
    this.productDetailsLoading.set(true);
    this.showProductDetailsModal.set(true);
    this.profileService.getProductDetails(productId).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          console.log(res);
          
          this.selectedProduct.set(res.data);
        } else {
          this.toastr.error(res?.message ?? 'فشل تحميل تفاصيل المنتج', 'خطأ');
        }
        this.productDetailsLoading.set(false);
      },
      error: () => {
        this.toastr.error('فشل تحميل تفاصيل المنتج', 'خطأ');
        this.productDetailsLoading.set(false);
      },
    });
  }

  closeProductDetails(): void {
    this.showProductDetailsModal.set(false);
    this.selectedProduct.set(null);
  }

  openAddProduct(): void {
    this.productForm.set({ 
      id: null, 
      name: '', 
      description: '', 
      categoryId: null, 
      quantity: null, 
      unit: 'كيلو', 
      unitPrice: null, 
      harvestDate: '', 
      expiryDate: '' 
    });
    this.productImages.set([]);
    this.productImagePreviews.set([]);
    this.productModalMode.set('add');
    this.showProductModal.set(true);
  }

  openEditProduct(product: any): void {
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
    this.productImages.set([]);
    this.productImagePreviews.set([]);
    this.productModalMode.set('edit');
    this.showProductModal.set(true);
  }

  async onProductImagesChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    
    if (files.length === 0) return;
    
    const currentFiles = this.productImages();
    this.productImages.set([...currentFiles, ...files]);
    
    const newPreviews: string[] = [];
    let loaded = 0;
    
    for (const file of files) {
      try {
        const preview = await this.readFileAsDataURL(file);
        newPreviews.push(preview);
        loaded++;
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }
    
    if (loaded > 0) {
      const currentPreviews = this.productImagePreviews();
      this.productImagePreviews.set([...currentPreviews, ...newPreviews]);
    }
    
    input.value = '';
  }

  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  removeProductImage(index: number): void {
    const files = [...this.productImages()];
    const previews = [...this.productImagePreviews()];
    files.splice(index, 1);
    previews.splice(index, 1);
    this.productImages.set(files);
    this.productImagePreviews.set(previews);
  }

  updateProductForm(field: string, value: any): void {
    this.productForm.update(f => ({ ...f, [field]: value }));
  }

  saveProduct(): void {
    this.productLoading.set(true);
    const form = this.productForm();
    const isEdit = this.productModalMode() === 'edit';

    if (isEdit) {
      this.profileService.editProduct({ ...form }).subscribe({
        next: (res) => {
          if (res?.isSuccess) { 
            this.loadProducts(); 
            this.showProductModal.set(false); 
            this.toastr.success('تم تعديل المنتج', ' نجاح'); 
          } else {
            this.toastr.error(res?.message ?? 'فشل التعديل', 'خطأ');
          }
          this.productLoading.set(false);
        },
        error: () => { 
          this.toastr.error('فشل التعديل', 'خطأ'); 
          this.productLoading.set(false); 
        },
      });
    } else {
      const formData = new FormData();
      formData.append('Name', form.name);
      formData.append('Description', form.description || '');
      formData.append('CategoryId', String(form.categoryId));
      formData.append('Quantity', String(form.quantity));
      formData.append('Unit', form.unit || 'كيلو');
      formData.append('UnitPrice', String(form.unitPrice));
      if (form.harvestDate) {
        formData.append('HarvestDate', new Date(form.harvestDate).toISOString());
      }
      if (form.expiryDate) {
        formData.append('ExpiryDate', new Date(form.expiryDate).toISOString());
      }
      formData.append('PublishImmediately', 'true');
      
      this.productImages().forEach(file => {
        formData.append('Images', file);
      });
      
      this.profileService.addProduct(formData).subscribe({
        next: (res) => {
          if (res?.isSuccess) { 
            this.loadProducts(); 
            this.showProductModal.set(false); 
            this.toastr.success('تم إضافة المنتج', ' نجاح'); 
          } else {
            this.toastr.error(res?.message ?? 'فشل الإضافة', 'خطأ');
          }
          this.productLoading.set(false);
        },
        error: (err) => {
          console.error('Error adding product:', err);
          this.toastr.error('فشل الإضافة', 'خطأ'); 
          this.productLoading.set(false); 
        },
      });
    }
  }

  confirmDeleteProduct(id: number): void { 
    this.deleteProductId.set(id); 
  }

  deleteProduct(): void {
    const id = this.deleteProductId();
    if (!id) return;
    
    this.deleteLoading.set(true);
    this.profileService.deleteProduct(id).subscribe({
      next: (res) => {
        if (res?.isSuccess) { 
          this.loadProducts(); 
          this.toastr.success('تم حذف المنتج', ' نجاح'); 
        } else {
          this.toastr.error(res?.message ?? 'فشل الحذف', 'خطأ');
        }
        this.deleteProductId.set(null);
        this.deleteLoading.set(false);
      },
      error: () => { 
        this.toastr.error('فشل الحذف', 'خطأ'); 
        this.deleteLoading.set(false); 
      },
    });
  }

  // ── Orders ───────────────────────────────────────────────
  loadOrders(): void {
    // Don't reload if already loading or data exists
    if (this.ordersLoading() || this.orders().length > 0) {
      return;
    }
    
    this.ordersLoading.set(true);
    this.profileService.getMyOrdersFarmer().subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          console.log(res);
          
          this.orders.set(res.data);
        }
        this.ordersLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.ordersLoading.set(false);
      },
    });
  }

  confirmOrder(id: number): void {
    this.orderActionLoading.set(true);
    this.profileService.confirmOrder(id).subscribe({
      next: (res) => {
        if (res?.isSuccess) { 
          this.loadOrders(); 
          this.toastr.success('تم قبول الطلب', ' نجاح'); 
        } else {
          this.toastr.error(res?.message ?? 'فشل', 'خطأ');
        }
        this.orderActionLoading.set(false);
      },
      error: () => { 
        this.toastr.error('فشل', 'خطأ'); 
        this.orderActionLoading.set(false); 
      },
    });
  }

  openRejectModal(id: number): void { 
    this.rejectOrderId.set(id); 
    this.rejectReason.set(''); 
  }

  submitReject(): void {
    const id = this.rejectOrderId();
    if (!id) return;
    
    this.orderActionLoading.set(true);
    this.profileService.rejectOrder(id, this.rejectReason()).subscribe({
      next: (res) => {
        if (res?.isSuccess) { 
          this.loadOrders(); 
          this.toastr.success('تم رفض الطلب', ' نجاح'); 
        } else {
          this.toastr.error(res?.message ?? 'فشل', 'خطأ');
        }
        this.rejectOrderId.set(null);
        this.orderActionLoading.set(false);
      },
      error: () => { 
        this.toastr.error('فشل', 'خطأ'); 
        this.orderActionLoading.set(false); 
      },
    });
  }

  changeOrderStatus(orderId: number, status: number): void {
    this.orderActionLoading.set(true);
    this.profileService.changeStatus(orderId, status).subscribe({
      next: (res) => {
        if (res?.isSuccess) { 
          this.loadOrders(); 
          this.toastr.success('تم تحديث الحالة', ' نجاح'); 
        } else {
          this.toastr.error(res?.message ?? 'فشل', 'خطأ');
        }
        this.orderActionLoading.set(false);
      },
      error: () => {
        this.toastr.error('فشل', 'خطأ');
        this.orderActionLoading.set(false);
      },
    });
  }
  getPaymentMethod(method: number): string {
    const methods: Record<number, string> = {
      0: 'كاش',
      1: 'تحويل بنكي',
      2: 'محفظة رقمية',
      3: 'بطاقة ائتمان',
    };
    return methods[method] || 'طريقة غير معروفة';
  }

  
  viewOrderDetails(orderId: number): void {
    this.orderDetailsLoading.set(true);
    this.showOrderDetailsModal.set(true);
    this.selectedOrderId.set(orderId);
    
    // إعادة تعيين البيانات السابقة
    this.selectedOrderPayments.set([]);
    this.deliveryMethod.set(null);
    this.selectedOrder.set(null);  // ← مهم جداً
    
    this.profileService.getOrderDetails(orderId).subscribe({
      next: (res) => {
        console.log('📦 Order Details:', res);
        
        if (res?.isSuccess && res?.data) {
          const order = res.data;
          
          // ✅ تخزين الطلب كامل في selectedOrder
          this.selectedOrder.set(order);
          console.log('✅ selectedOrder set:', this.selectedOrder());
          
          // معالجة الدفع
          if (order.payment) {
            this.selectedOrderPayments.set([order.payment]);
          } else {
            this.selectedOrderPayments.set([]);
          }
          
          // معالجة طريقة التوصيل
          if (order.deliveryMethod) {
            this.deliveryMethod.set(order.deliveryMethod);
          } else {
            this.deliveryMethod.set(null);
          }
          
        } else {
          this.toastr.warning(res?.message || 'لا توجد بيانات للطلب', 'تنبيه');
          this.selectedOrderPayments.set([]);
          this.deliveryMethod.set(null);
        }
        
        this.orderDetailsLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Error:', err);
        this.toastr.error('فشل تحميل تفاصيل الطلب', 'خطأ');
        this.selectedOrderPayments.set([]);
        this.deliveryMethod.set(null);
        this.selectedOrder.set(null);
        this.orderDetailsLoading.set(false);
      },
    });
  }

  closeOrderDetails(): void {
  this.showOrderDetailsModal.set(false);
  this.selectedOrderId.set(null);
  this.selectedOrderPayments.set([]);
  this.deliveryMethod.set(null);
  this.selectedOrder.set(null);  // ← إعادة تعيين
}

  openCancelOrder(orderId: number): void {
    this.cancelOrderId.set(orderId);
  }

  confirmCancelOrder(): void {
    const orderId = this.cancelOrderId();
    if (!orderId) return;
    
    this.cancelOrderLoading.set(true);
    this.profileService.cancelOrder(orderId).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.loadOrders();
          this.toastr.success('تم إلغاء الطلب', ' نجاح');
        } else {
          this.toastr.error(res?.message ?? 'فشل إلغاء الطلب', 'خطأ');
        }
        this.cancelOrderId.set(null);
        this.cancelOrderLoading.set(false);
      },
      error: () => {
        this.toastr.error('فشل إلغاء الطلب', 'خطأ');
        this.cancelOrderId.set(null);
        this.cancelOrderLoading.set(false);
      },
    });
  }

  // ── Auctions ─────────────────────────────────────────────
  loadAuctions(): void {
    // Don't reload if already loading or data exists
    if (this.auctionsLoading() || this.auctions().length > 0) {
      return;
    }
    
    this.auctionsLoading.set(true);
    this.profileService.getMyAuctions().subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.auctions.set(res.data);
        }
        this.auctionsLoading.set(false);
      },
      error: () => {
        this.auctionsLoading.set(false);
      },
    });
  }

  openCreateAuctionModal(productId?: number): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    this.auctionForm.set({
      productId: productId ?? null,
      startDate: formatDate(tomorrow),
      endDate: formatDate(nextWeek),
      startingPrice: null,
      reservePrice: null,
    });
    this.showCreateAuctionModal.set(true);
  }

  saveAuction(): void {
    const form = this.auctionForm();
    if (!form.productId || !form.startingPrice || !form.startDate || !form.endDate) {
      this.toastr.error('يرجى تعبئة جميع الحقول المطلوبة', 'خطأ');
      return;
    }
    
    if (form.startingPrice <= 0) {
      this.toastr.error('سعر البداية يجب أن يكون أكبر من 0', 'خطأ');
      return;
    }
    
    this.auctionLoading.set(true);
    this.profileService.createAuctions({
      productId: form.productId,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      startingPrice: form.startingPrice,
      reservePrice: form.reservePrice ?? form.startingPrice,
    }).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.showCreateAuctionModal.set(false);
          this.loadProducts();
          this.loadAuctions();
          this.toastr.success('تم إنشاء المزاد بنجاح', ' نجاح');
        } else {
          this.toastr.error(res?.message ?? 'فشل إنشاء المزاد', 'خطأ');
        }
        this.auctionLoading.set(false);
      },
      error: (err) => { 
        console.error('Error creating auction:', err);
        this.toastr.error('فشل إنشاء المزاد', 'خطأ'); 
        this.auctionLoading.set(false); 
      },
    });
  }

  updateAuctionForm(field: string, value: any): void {
    this.auctionForm.update(f => ({ ...f, [field]: value }));
  }

  // ── Helpers ──────────────────────────────────────────────
  getOrderStatus(status: string) {
    return ORDER_STATUS_MAP[status] ?? { 
      label: status, 
      bgClass: 'bg-gray-100', 
      textClass: 'text-gray-500', 
      icon: 'info' 
    };
  }

  getAuctionStatus(status: string) {
    return AUCTION_STATUS_MAP[status] ?? { 
      label: status, 
      bgClass: 'bg-gray-100', 
      textClass: 'text-gray-500', 
      icon: 'info' 
    };
  }

  getProductStatus(status: number) {
    return PRODUCT_STATUS_MAP[status] ?? { 
      label: 'غير معروف', 
      bgClass: 'bg-gray-100', 
      textClass: 'text-gray-500' 
    };
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-EG', { 
      style: 'currency', 
      currency: 'EGP', 
      maximumFractionDigits: 0 
    }).format(price);
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  formatDateTime(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleString('ar-EG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  loadDeliveryMethod(methodId: number): void {
    if (!methodId) return;
    this.deliveryMethodLoading.set(true);
    this.profileService.getDeliveryMethod(methodId).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.deliveryMethod.set(res.data);
        } else {
          this.toastr.error(res?.message || 'فشل تحميل طريقة التوصيل', 'خطأ');
        }
        this.deliveryMethodLoading.set(false);
      },
      error: () => {
        this.toastr.error('فشل تحميل طريقة التوصيل', 'خطأ');
        this.deliveryMethodLoading.set(false);
      },
    });
  }

  addProductImage(productId: number, file: File): void {
    if (!productId || !file) return;
    this.addingProductImage.set(true);
    
    this.profileService.addProductImages(productId, file).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.toastr.success('تم إضافة الصورة بنجاح', ' نجاح');
          // إعادة تحميل تفاصيل المنتج لتحديث الصور
          this.viewProductDetails(productId);
        } else {
          this.toastr.error(res?.message || 'فشل إضافة الصورة', 'خطأ');
        }
        this.addingProductImage.set(false);
      },
      error: () => {
        this.toastr.error('فشل إضافة الصورة', 'خطأ');
        this.addingProductImage.set(false);
      },
    });
  }

  deleteProductImage(productId: number, image: string): void {
    if (!productId || !image) return;
    this.deletingImageId.set(image);
    
    this.profileService.deleteImage(productId, image).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.toastr.success('تم حذف الصورة بنجاح', ' نجاح');
          // إعادة تحميل تفاصيل المنتج
          this.viewProductDetails(productId);
        } else {
          this.toastr.error(res?.message || 'فشل حذف الصورة', 'خطأ');
        }
        this.deletingImageId.set(null);
      },
      error: () => {
        this.toastr.error('فشل حذف الصورة', 'خطأ');
        this.deletingImageId.set(null);
      },
    });
  }

  onAddProductImage(event: Event, productId: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !productId) return;
    
    this.addProductImage(productId, file);
    input.value = ''; // إعادة تعيين الإدخال
  }

  getPaymentStatus(status: number): string {
    const statusMap: Record<number, string> = {
      0: 'غير مدفوع',
      1: 'مدفوع',
      2: 'تم الاسترداد',
      3: 'فشل الدفع'
    };
    return statusMap[status];
  }

  getLogisticsStatus(status: number): string {
    const statusMap: Record<number, string> = {
      0: 'غير مجدول',
      1: 'تمت الجدولة',
      2: 'تم الاستلام',
      3: 'قيد النقل',
      4: 'تم التسليم',
      5: 'فشل التوصيل'
    };

    return statusMap[status] || 'غير معروف';
  }
}