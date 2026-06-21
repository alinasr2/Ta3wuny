// trader.component.ts
import { Component, inject, OnInit, signal, computed, effect, WritableSignal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Users } from '../../core/services/users/users';
import { Itrader } from '../../shared/interfaces/itrader';

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
  selector: 'app-trader',
  imports: [CommonModule],
  templateUrl: './trader.html',
  styleUrl: './trader.scss',
})
export class Trader implements OnInit {
  private route = inject(ActivatedRoute);
  private usersService = inject(Users);

  // Data signals
  trader = signal<Itrader | null>(null);
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

  // Loading states
  isLoadingTrader = signal<boolean>(true);
  isLoadingReviews = signal<boolean>(true);

  // Error states
  errorTrader = signal<string | null>(null);
  errorReviews = signal<string | null>(null);

  // UI state
  activeTab = signal<'about' | 'reviews'>('about');

  // Computed signals
  customerSatisfaction = computed(() => {
    const summary = this.ratingSummary();
    if (summary.totalReviews === 0) return 0;
    return Math.round(
      ((summary.fourStars + summary.fiveStars) / summary.totalReviews) * 100
    );
  });

  // Effects for error logging
  constructor() {
    effect(() => {
      const error = this.errorTrader();
      if (error) {
        console.error('Trader error:', error);
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
    console.log('Route ID:', id);
    if (id) {
      this.loadTrader(id);
      this.loadReviews(id);
      this.loadRating(id);
    }
  }

  loadTrader(id: string) {
    this.isLoadingTrader.set(true);
    this.errorTrader.set(null);

    this.usersService.getTraderProfile(id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.trader.set(res.data);
        } else {
          this.errorTrader.set(res.message || 'فشل في تحميل بيانات التاجر');
        }
        this.isLoadingTrader.set(false);
      },
      error: () => {
        this.errorTrader.set('حدث خطأ في تحميل بيانات التاجر');
        this.isLoadingTrader.set(false);
      },
    });
  }

  loadReviews(id: string) {
    this.isLoadingReviews.set(true);
    this.errorReviews.set(null);

    this.usersService.getUserReview(id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.reviews.set(res.data ?? []);
        } else {
          this.reviews.set([]);
        }
        this.isLoadingReviews.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.reviews.set([]);
        } else {
          this.errorReviews.set('حدث خطأ في تحميل التقييمات');
        }
        this.isLoadingReviews.set(false);
      },
    });
  }

  loadRating(id: string) {
    this.usersService.getUserRating(id).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.ratingSummary.set(res.data);
        }
      },
      error: (err) => {
        if (err.status === 404) {
          this.ratingSummary.set({
            averageRating: 0,
            totalReviews: 0,
            fiveStars: 0,
            fourStars: 0,
            threeStars: 0,
            twoStars: 0,
            oneStar: 0,
          });
        }
      },
    });
  }

  getRatingPercentage(count: number): string {
    const total = this.ratingSummary().totalReviews;
    if (total === 0) return '0%';
    return `${(count / total) * 100}%`;
  }

  goBack() {
    window.history.back();
  }

  // Expose to template
  getCustomerSatisfaction(): number {
    return this.customerSatisfaction();
  }
}