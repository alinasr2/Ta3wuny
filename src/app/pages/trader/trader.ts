import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Users } from '../../core/services/users/users';
import { Itrader } from '../../shared/interfaces/itrader';

@Component({
  selector: 'app-trader',
  imports: [CommonModule],
  templateUrl: './trader.html',
  styleUrl: './trader.scss',
})
export class Trader implements OnInit {
  private route = inject(ActivatedRoute);
  private usersService = inject(Users);

  trader: Itrader | null = null;
  reviews: any[] = [];
  ratingSummary: any = {
    averageRating: 0,
    totalReviews: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0,
  };

  isLoadingTrader = true;
  isLoadingReviews = true;
  activeTab = 'about';
  errorTrader: string | null = null;
  errorReviews: string | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTrader(id);
      this.loadReviews(id);
      this.loadRating(id);
    }
  }

  loadTrader(id: string) {
    this.usersService.getTraderProfile(id).subscribe({
      next: (res) => {
        if (res.isSuccess) this.trader = res.data;
        else this.errorTrader = res.message;
        this.isLoadingTrader = false;
      },
      error: () => {
        this.errorTrader = 'حدث خطأ في تحميل بيانات التاجر';
        this.isLoadingTrader = false;
      },
    });
  }

  loadReviews(id: string) {
    this.usersService.getUserReview(id).subscribe({
      next: (res) => {
        if (res.isSuccess) this.reviews = res.data ?? [];
        this.isLoadingReviews = false;
      },
      error: () => (this.isLoadingReviews = false),
    });
  }

  loadRating(id: string) {
    this.usersService.getUserRating(id).subscribe({
      next: (res) => {
        if (res.isSuccess) this.ratingSummary = res.data;
      },
    });
  }

  getRatingPercentage(count: number): string {
    if (this.ratingSummary.totalReviews === 0) return '0%';
    return `${(count / this.ratingSummary.totalReviews) * 100}%`;
  }

  goBack() {
    window.history.back();
  }

  getCustomerSatisfaction(): number {
    if (this.ratingSummary.totalReviews === 0) return 0;
    return Math.round(
      ((this.ratingSummary.fourStars + this.ratingSummary.fiveStars) /
        this.ratingSummary.totalReviews) *
        100,
    );
  }
}
