// farmer-details.component.ts
import { NgIf, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { inject, Injectable } from '@angular/core';
import { Users } from '../../core/services/users/users';


@Component({
  selector: 'app-farmer',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  templateUrl: './farmer.html',
  styleUrls: ['./farmer.scss'],
})
export class Farmer implements OnInit {
  activeTab: string = 'products';
  farmerId: string | null = null;
  
  // بيانات المزارع
  farmerData: any = {
    name: '',
    farmName: '',
    description: '',
    email: '',
    userName: '',
    address: {
      city: '',
      governorate: ''
    },
    profileImageUrl: '',
    joinDate: '',
    isVerified: false
  };
  
  // المنتجات
  products: any[] = [];
  
  // التقييمات
  reviews: any[] = [];
  ratingSummary: any = {
    averageRating: 0,
    totalReviews: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0
  };
  
  // حالة التحميل
  isLoadingFarmer: boolean = true;
  isLoadingProducts: boolean = true;
  isLoadingReviews: boolean = true;
  
  // الأخطاء
  errorFarmer: string | null = null;
  errorProducts: string | null = null;
  errorReviews: string | null = null;

  private readonly usersService = inject(Users);
  private readonly route = inject(ActivatedRoute);

  ngOnInit() {
    this.farmerId = this.route.snapshot.paramMap.get('id');
    if (this.farmerId) {
      this.loadFarmerData();
      this.loadFarmerProducts();
      this.loadFarmerReviews();
      this.loadFarmerRating();
    }
  }

  loadFarmerData() {
    this.isLoadingFarmer = true;
    this.errorFarmer = null;
    
    this.usersService.getFarmer(this.farmerId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.farmerData = response.data;
        } else {
          this.errorFarmer = response.message || 'فشل في تحميل بيانات المزارع';
        }
        this.isLoadingFarmer = false;
      },
      error: (error) => {
        this.errorFarmer = 'حدث خطأ في تحميل بيانات المزارع';
        this.isLoadingFarmer = false;
        console.error('Error loading farmer:', error);
      }
    });
  }

  loadFarmerProducts() {
    this.isLoadingProducts = true;
    this.errorProducts = null;
    
    this.usersService.getFarmerProducts(this.farmerId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.products = response.data;
        } else {
          this.errorProducts = response.message || 'لا توجد منتجات متاحة';
        }
        this.isLoadingProducts = false;
      },
      error: (error) => {
        this.errorProducts = 'حدث خطأ في تحميل المنتجات';
        this.isLoadingProducts = false;
        console.error('Error loading products:', error);
      }
    });
  }

  loadFarmerReviews() {
    this.isLoadingReviews = true;
    this.errorReviews = null;
    
    this.usersService.getUserReview(this.farmerId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.reviews = response.data;
        } else {
          this.reviews = [];
        }
        this.isLoadingReviews = false;
      },
      error: (error) => {
        this.errorReviews = 'حدث خطأ في تحميل التقييمات';
        this.isLoadingReviews = false;
        console.error('Error loading reviews:', error);
      }
    });
  }

  loadFarmerRating() {
    this.usersService.getUserRating(this.farmerId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.ratingSummary = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading rating:', error);
      }
    });
  }

  // دالة مساعدة لحساب نسبة كل تقييم
  getRatingPercentage(count: number): string {
    if (this.ratingSummary.totalReviews === 0) return '0%';
    return `${(count / this.ratingSummary.totalReviews) * 100}%`;
  }

  // دالة لتوليد مجموعة النجوم
  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  
  
  }



  // نسخة مختصرة من الدوال
goBack() {
  window.history.back();
}

getTotalSold = () => 1247;

getCustomerSatisfaction = () => 
  this.ratingSummary.totalReviews === 0 ? 0 : 
  Math.round(((this.ratingSummary.fourStars + this.ratingSummary.fiveStars) / this.ratingSummary.totalReviews) * 100);

getAverageDeliveryDays = () => '3-5 أيام';
}