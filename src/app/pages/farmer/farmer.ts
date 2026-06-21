// farmer-details.component.ts
import { NgIf, NgFor, CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal, computed, effect, WritableSignal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Users } from '../../core/services/users/users';
import { ReviewService } from '../../core/services/Reviews/review-service';

interface FarmerData {
  name: string;
  farmName: string;
  description: string;
  email: string;
  userName: string;
  address: {
    city: string;
    governorate: string;
  };
  profileImageUrl: string;
  joinDate: string;
  isVerified: boolean;
  coverImageUrl?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  unit: string;
  mainImageUrl?: string;
}

interface Review {
  id: string;
  reviewerName: string;
  reviewerImageUrl?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
}

@Component({
  selector: 'app-farmer',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, CommonModule, FormsModule],
  templateUrl: './farmer.html',
  styleUrls: ['./farmer.scss'],
})
export class Farmer implements OnInit {
  private reviewsService = inject(ReviewService);
  private usersService = inject(Users);
  private route = inject(ActivatedRoute);

  // Signals for UI state
  activeTab = signal<'products' | 'reviews'>('products');
  farmerId = signal<string | null>(null);

  // Signals for data
  farmerData = signal<FarmerData>({
    name: '',
    farmName: '',
    description: '',
    email: '',
    userName: '',
    address: {
      city: '',
      governorate: '',
    },
    profileImageUrl: '',
    joinDate: '',
    isVerified: false,
  });

  products = signal<Product[]>([]);
  reviews = signal<Review[]>([]);
  ratingSummary = signal<RatingSummary>({
    averageRating: 0,
    totalReviews: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0,
  });

  // Loading states as signals
  isLoadingFarmer = signal<boolean>(true);
  isLoadingProducts = signal<boolean>(true);
  isLoadingReviews = signal<boolean>(true);

  // Error states as signals
  errorFarmer = signal<string | null>(null);
  errorProducts = signal<string | null>(null);
  errorReviews = signal<string | null>(null);

  // Computed signals for derived data
  totalSold = signal<number>(1247);
  averageDeliveryDays = signal<string>('3-5 أيام');

  customerSatisfaction = computed(() => {
    const summary = this.ratingSummary();
    if (summary.totalReviews === 0) return 0;
    return Math.round(
      ((summary.fourStars + summary.fiveStars) / summary.totalReviews) * 100
    );
  });

  // Effect to log errors (optional)
  constructor() {
    effect(() => {
      const error = this.errorFarmer();
      if (error) {
        console.error('Farmer error:', error);
      }
    });

    effect(() => {
      const error = this.errorProducts();
      if (error) {
        console.error('Products error:', error);
      }
    });

    effect(() => {
      const error = this.errorReviews();
      if (error) {
        console.error('Reviews error:', error);
      }
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.farmerId.set(id);
    
    if (id) {
      this.loadFarmerData();
      this.loadFarmerProducts();
      this.loadFarmerReviews();
      this.loadFarmerRating();
    }
  }

  loadFarmerData() {
    this.isLoadingFarmer.set(true);
    this.errorFarmer.set(null);

    this.usersService.getFarmer(this.farmerId()).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.farmerData.set(response.data);
        } else {
          this.errorFarmer.set(response.message || 'فشل في تحميل بيانات المزارع');
        }
        this.isLoadingFarmer.set(false);
      },
      error: (error) => {
        this.errorFarmer.set('حدث خطأ في تحميل بيانات المزارع');
        this.isLoadingFarmer.set(false);
        console.error('Error loading farmer:', error);
      },
    });
  }

  loadFarmerProducts() {
    this.isLoadingProducts.set(true);
    this.errorProducts.set(null);

    this.usersService.getFarmerProducts(this.farmerId()).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.products.set(response.data);
        } else {
          this.errorProducts.set(response.message || 'لا توجد منتجات متاحة');
        }
        this.isLoadingProducts.set(false);
      },
      error: (error) => {
        this.errorProducts.set('حدث خطأ في تحميل المنتجات');
        this.isLoadingProducts.set(false);
        console.error('Error loading products:', error);
      },
    });
  }

  loadFarmerReviews() {
    this.isLoadingReviews.set(true);
    this.errorReviews.set(null);

    this.reviewsService.getUserReviews(this.farmerId()!).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.reviews.set(response.data);
          console.log('reviews:', this.reviews());
        } else {
          this.reviews.set([]);
        }
        this.isLoadingReviews.set(false);
      },
      error: () => {
        this.errorReviews.set('حدث خطأ في تحميل التقييمات');
        this.isLoadingReviews.set(false);
      },
    });
  }

  loadFarmerRating() {
    this.reviewsService.getUserRatingSummary(this.farmerId()!).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.ratingSummary.set(response.data);
        }
      },
      error: () => {
        // Silent fail for rating summary
      },
    });
  }

  // Helper functions
  getRatingPercentage(count: number): string {
    const total = this.ratingSummary().totalReviews;
    if (total === 0) return '0%';
    return `${(count / total) * 100}%`;
  }

  goBack() {
    window.history.back();
  }

  // Expose signals to template
  getTotalSold(): number {
    return this.totalSold();
  }

  getAverageDeliveryDays(): string {
    return this.averageDeliveryDays();
  }

  // These are kept for template compatibility but use signals internally
  getCustomerSatisfaction(): number {
    return this.customerSatisfaction();
  }
}