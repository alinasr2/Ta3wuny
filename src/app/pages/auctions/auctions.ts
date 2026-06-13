import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuctionsService } from '../../core/services/Auctions/auctions';


interface Auction {
  id: number;
  productId: number;
  farmerId: string;
  winnerId?: string;
  startDate: string;
  endDate: string;
  startingPrice: number;
  reservePrice: number;
  status: number; // 0: pending, 1: active, 2: ended, 3: cancelled, 4: sold
  product?: {
    name: string;
    description: string;
    imageUrl?: string;
    category?: string;
  };
  bids?: Bid[];
}

interface Bid {
  id: number;
  auctionId: number;
  userId: string;
  userName?: string;
  amount: number;
  createdAt: string;
}

@Component({
  selector: 'app-auctions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './auctions.html',
  styleUrls: ['./auctions.scss'],
 changeDetection: ChangeDetectionStrategy.Default 
})
export class Auctions implements OnInit {
  // متغيرات المزادات
  auctions: Auction[] = [];
  filteredAuctions: Auction[] = [];
  isLoading = true;
  searchTerm = '';
  selectedStatus = 'all';

  statuses = [
    { value: 'all', label: 'الكل' },
    { value: '0', label: 'قيد الانتظار' },
    { value: '1', label: 'نشط' },
    { value: '2', label: 'منتهي' },
    { value: '3', label: 'ملغي' },
    { value: '4', label: 'تم البيع' },
  ];

  // متغيرات الـ Dialog
  showDialog = false;
  selectedAuction: Auction | null = null;
  bidAmount: number | null = null;
  isSubmittingBid = false;
  minBidAmount: number = 0;
  auctionBids: Bid[] = [];

  constructor(
    private auctionsService: AuctionsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAuctions();
  }

  loadAuctions(): void {
  this.isLoading = true;
  this.auctionsService.getAllAuctions({ pageSize: 100, pageIndex: 0 }).subscribe({
    next: (response: any) => {
      console.log(response);
      
      // المفتاح: الوصول إلى المسار الصحيح للبيانات
      let auctionsData: Auction[] = [];
      
      if (response?.data?.data && Array.isArray(response.data.data)) {
        // هذا هو الشكل الصحيح لاستجابتك
        auctionsData = response.data.data;
      } 
      else if (response?.data && Array.isArray(response.data)) {
        auctionsData = response.data;
      }
      else if (response?.items && Array.isArray(response.items)) {
        auctionsData = response.items;
      }
      else if (Array.isArray(response)) {
        auctionsData = response;
      }
      
      // مهم مع OnPush: إنشاء مصفوفة جديدة (وليس تعديل الموجودة)
      this.auctions = [...auctionsData];
      this.filterAuctions();
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error loading auctions:', error);
      this.snackBar.open('حدث خطأ في تحميل المزادات', 'إغلاق', { duration: 3000 });
      this.isLoading = false;
    },
  });
}

  filterAuctions(): void {
  let filtered = [...this.auctions];  // إنشاء نسخة جديدة

  if (this.selectedStatus !== 'all') {
    filtered = filtered.filter(
      (auction) => auction.status.toString() === this.selectedStatus
    );
  }

  if (this.searchTerm.trim()) {
    const term = this.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (auction) =>
        auction.product?.name?.toLowerCase().includes(term) ||
        auction.product?.description?.toLowerCase().includes(term)
    );
  }

  this.filteredAuctions = [...filtered];  // مرجع جديد وليس تعديل مباشر
}

  onSearchChange(): void {
    this.filterAuctions();
  }

  onStatusChange(): void {
    this.filterAuctions();
  }

  // فتح الـ Dialog
  openAuctionDialog(auction: Auction): void {
    this.selectedAuction = auction;
    this.showDialog = true;
    this.bidAmount = null;
    this.loadAuctionBids(auction.id);
    this.calculateMinBid();
  }

  // إغلاق الـ Dialog
  closeDialog(): void {
    this.showDialog = false;
    this.selectedAuction = null;
    this.bidAmount = null;
    this.isSubmittingBid = false;
    this.auctionBids = [];
  }

  // تحميل عروض المزاد
  loadAuctionBids(auctionId: number): void {
  this.auctionsService.getAuctionBids(auctionId).subscribe({
    next: (response: any) => {
      let bidsData: Bid[] = [];
      
      if (response?.data && Array.isArray(response.data)) {
        bidsData = response.data;
      } else if (Array.isArray(response)) {
        bidsData = response;
      }
      
      // إنشاء مصفوفة جديدة
      this.auctionBids = [...bidsData];
      this.calculateMinBid();
    },
    error: (error) => {
      console.error('Error loading bids:', error);
      this.auctionBids = [];
    },
  });
}

  // حساب أقل عرض مسموح
  calculateMinBid(): void {
    if (!this.selectedAuction) return;
    const highestBid = this.getHighestBid();
    this.minBidAmount = highestBid + (highestBid * 0.05);
  }

  getHighestBid(): number {
    if (!this.auctionBids || this.auctionBids.length === 0) {
      return this.selectedAuction?.startingPrice || 0;
    }
    return Math.max(...this.auctionBids.map((bid) => bid.amount));
  }

  getBidCount(): number {
    return this.auctionBids?.length || 0;
  }

  getTimeRemaining(endDate: string): string {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) {
      return 'انتهى المزاد';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `متبقي ${days} يوم ${hours} ساعة`;
    }
    if (hours > 0) {
      return `متبقي ${hours} ساعة ${minutes} دقيقة`;
    }
    return `متبقي ${minutes} دقيقة`;
  }

  isAuctionActive(): boolean {
    if (!this.selectedAuction) return false;
    return this.selectedAuction.status === 1 && 
           new Date(this.selectedAuction.endDate).getTime() > new Date().getTime();
  }

  isValidBid(): boolean {
    return (
      this.bidAmount !== null &&
      this.selectedAuction !== null &&
      this.bidAmount >= this.minBidAmount &&
      this.isAuctionActive()
    );
  }

  placeBid(): void {
    if (!this.isValidBid() || !this.selectedAuction) return;

    this.isSubmittingBid = true;

    this.auctionsService.placeBid(this.selectedAuction.id, { amount: this.bidAmount! }).subscribe({
      next: (response: any) => {
        this.snackBar.open('تم إضافة عرضك بنجاح!', 'إغلاق', { duration: 3000 });
        
        // إعادة تحميل العروض
        this.loadAuctionBids(this.selectedAuction!.id);
        this.bidAmount = null;
        this.isSubmittingBid = false;
      },
      error: (error) => {
        console.error('Error placing bid:', error);
        this.snackBar.open(error.error?.message || 'حدث خطأ في إضافة العرض', 'إغلاق', { duration: 3000 });
        this.isSubmittingBid = false;
      },
    });
  }

  getStatusLabel(status: number): string {
    const statuses: Record<number, string> = {
      0: 'قيد الانتظار',
      1: 'نشط',
      2: 'منتهي',
      3: 'ملغي',
      4: 'تم البيع',
    };
    return statuses[status] || 'غير معروف';
  }

  getStatusClass(status: number): string {
    const classes: Record<number, string> = {
      0: 'status-pending',
      1: 'status-active',
      2: 'status-ended',
      3: 'status-cancelled',
      4: 'status-sold',
    };
    return classes[status] || '';
  }
}