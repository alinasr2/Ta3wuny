import { Component, OnInit, inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { ProfileService, Auction } from '../../core/services/profileSerivce/profile-service';
import { Product } from '../product/product';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class Profile implements OnInit, AfterViewInit {
  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  // Data
  products: any[] = [];
  auctions: Auction[] = [];
  
  // Loading states
  loadingProducts = true; // Changed to true initially
  loadingAuctions = true; // Changed to true initially
  submittingProduct = false;
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalProducts = 0;
  
  // Add Product Dialog State
  showAddProductDialog = false;
  productForm!: FormGroup;
  selectedImages: File[] = [];
  imagePreviews: string[] = [];

  ngOnInit(): void {
    this.initProductForm();
    // Load data with setTimeout to avoid ExpressionChangedAfterItHasBeenChecked
    setTimeout(() => {
      this.loadMyProducts();
      this.loadMyAuctions();
    });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  initProductForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      categoryId: ['', [Validators.required, Validators.min(1)]],
      quantity: ['', [Validators.required, Validators.min(0.1)]],
      unit: ['kg', Validators.required],
      unitPrice: ['', [Validators.required, Validators.min(0.1)]],
      harvestDate: ['', Validators.required],
      expiryDate: ['', Validators.required],
      publishImmediately: [true],
    });
  }

  loadMyProducts(): void {
    this.loadingProducts = true;
    this.profileService.getMyProducts().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.products = response.data.data || [];
          this.totalPages = response.data.totalPages || 0;
          this.totalProducts = response.data.count || 0;
          this.currentPage = response.data.pageIndex || 0;
        } else {
          console.error('Failed to load products:', response.message);
          this.products = [];
        }
        this.loadingProducts = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.showError(error.message || 'Error loading products');
        this.products = [];
        this.loadingProducts = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadMyAuctions(): void {
    this.loadingAuctions = true;
    this.profileService.getMyAuctions().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.auctions = response.data || [];
        } else {
          console.error('Failed to load auctions:', response.message);
          this.auctions = [];
        }
        this.loadingAuctions = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading auctions:', error);
        if (error.status !== 404) {
          this.showError(error.message || 'Error loading auctions');
        }
        this.auctions = [];
        this.loadingAuctions = false;
        this.cdr.detectChanges();
      },
    });
  }

  openAddProductDialog(): void {
    this.showAddProductDialog = true;
    this.productForm.reset({
      unit: 'kg',
      publishImmediately: true,
    });
    this.selectedImages = [];
    this.imagePreviews = [];
    this.cdr.detectChanges();
  }

  closeAddProductDialog(): void {
    this.showAddProductDialog = false;
    this.productForm.reset();
    this.selectedImages = [];
    this.imagePreviews = [];
    this.cdr.detectChanges();
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.selectedImages.push(...files);
      
      // Create previews
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreviews.push(e.target?.result as string);
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    this.cdr.detectChanges();
  }

  submitProduct(): void {
    if (this.productForm.invalid) {
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
      this.showError('Please fill all required fields correctly');
      return;
    }

    if (this.selectedImages.length === 0) {
      this.showError('Please select at least one product image');
      return;
    }

    this.submittingProduct = true;
    this.cdr.detectChanges();
    
    const formData = new FormData();
    
    // Add form fields
    const formValue = this.productForm.value;
    Object.keys(formValue).forEach(key => {
      if (formValue[key] !== null && formValue[key] !== undefined && formValue[key] !== '') {
        formData.append(key, formValue[key].toString());
      }
    });
    
    // Add images
    this.selectedImages.forEach((image) => {
      formData.append('Images', image);
    });

    this.profileService.addProduct(formData).subscribe({
      next: (response) => {
        this.submittingProduct = false;
        if (response.isSuccess) {
          this.showSuccess('Product added successfully!');
          this.closeAddProductDialog();
          this.loadMyProducts();
        } else {
          const errorMsg = response.errors?.join(', ') || response.message || 'Failed to add product';
          this.showError(errorMsg);
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.submittingProduct = false;
        console.error('Add product error:', error);
        const errorMsg = error.error?.errors?.join(', ') || error.message || 'Error adding product';
        this.showError(errorMsg);
        this.cdr.detectChanges();
      },
    });
  }

  deleteProduct(productId: number, productName: string): void {
    if (confirm(`Are you sure you want to delete "${productName}"?`)) {
      this.profileService.deleteProduct(productId).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.showSuccess('Product deleted successfully');
            this.loadMyProducts();
          } else {
            this.showError(response.message || 'Failed to delete product');
          }
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.showError(error.message || 'Error deleting product');
        },
      });
    }
  }

  getProductStatusBadge(status: number): string {
    const statusMap: Record<number, string> = {
      0: 'Pending',
      1: 'Active',
      2: 'Sold',
      3: 'Expired',
    };
    return statusMap[status] || 'Unknown';
  }

  getProductStatusColor(status: number): string {
    const colorMap: Record<number, string> = {
      0: 'bg-yellow-100 text-yellow-800',
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-gray-100 text-gray-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  }

  getAuctionStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Ended': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('eg-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(price || 0);
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }
}