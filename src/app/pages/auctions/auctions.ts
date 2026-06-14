import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AuctionsService } from '../../core/services/Auctions/auctions';
import { RouterLink } from '@angular/router';

export type AuctionStatus = 0 | 1 | 2 | 3 | 4;

export interface Auction {
  id: number;
  status: string;
  startDate: string;
  endDate: string;
  startingPrice: number;
  currentPrice: number;
  totalBids: number;
  isEnded: boolean;
  minutesRemaining: number;
  productId: number;
  productName: string;
  productUnit: string;
  productQuantity: number;
  mainImageUrl: string;
  farmerId: string;
  farmerName: string;
  farmerImage: string;
  winnerId: string;
  winnerName: string;
  winnerImage: string;
}

const STATUS_MAP: Record<AuctionStatus, { label: string; color: string; icon: string }> = {
  0: { label: 'الكل', color: 'bg-gray-100 text-gray-600', icon: 'list' },
  1: { label: 'قادمة', color: 'bg-blue-100 text-blue-700', icon: 'schedule' },
  2: { label: 'جارية', color: 'bg-green-100 text-green-700', icon: 'play_circle' },
  3: { label: 'منتهية', color: 'bg-red-100 text-red-600', icon: 'check_circle' },
  4: { label: 'ملغاة', color: 'bg-yellow-100 text-yellow-700', icon: 'cancel' },
};

@Component({
  selector: 'app-auctions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatPaginatorModule,
    RouterLink
  ],
  templateUrl: './auctions.html',
  styleUrls: ['./auctions.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Auctions implements OnInit {
  private auctionsService = inject(AuctionsService);

  // State signals
  auctions = signal<Auction[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  totalCount = signal(0);
  totalPages = signal(0);

  // Filter/pagination signals
  selectedStatus = signal<AuctionStatus | undefined>(undefined);
  pageIndex = signal(0);
  pageSize = signal(10);
  sortDescending = signal(true);

  // View mode
  viewMode = signal<'grid' | 'list'>('grid');

  // Computed
  statusOptions = computed(() => ([
    { value: undefined, label: 'الكل', icon: 'list', color: 'text-gray-600' },
    { value: 1, label: 'قادمة', icon: 'schedule', color: 'text-blue-600' },
    { value: 2, label: 'جارية', icon: 'play_circle', color: 'text-green-600' },
    { value: 3, label: 'منتهية', icon: 'check_circle', color: 'text-red-500' },
    { value: 4, label: 'ملغاة', icon: 'cancel', color: 'text-yellow-600' },
  ]));

  hasAuctions = computed(() => this.auctions().length > 0);

  ngOnInit(): void {
    this.loadAuctions();
  }

  loadAuctions(): void {
    this.loading.set(true);
    this.error.set(null);

    this.auctionsService
      .getAllAuctions({
        status: this.selectedStatus(),
        pageIndex: this.pageIndex(),
        pageSize: this.pageSize(),
        sortDescending: this.sortDescending(),
      })
      .subscribe({
        next: (res) => {
          console.log(res)
          if (res?.isSuccess) {
            this.auctions.set(res.data.data);
            this.totalCount.set(res.data.count);
            this.totalPages.set(res.data.totalPages);
          } else {
            this.error.set(res?.message || 'حدث خطأ ما');
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.log(err);
          this.auctions.set([]);
          this.totalCount.set(0);
          this.totalPages.set(1);
          // this.error.set('تعذّر الاتصال بالخادم، يرجى المحاولة لاحقاً');
          this.loading.set(false);
        },
      });
  }

  onStatusChange(status: AuctionStatus | undefined): void {
    this.selectedStatus.set(status);
    this.pageIndex.set(0);
    this.loadAuctions();
  }

  onPageChange(event: PageEvent): void {
    console.log(event);
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadAuctions();
  }

  toggleSort(): void {
    this.sortDescending.set(!this.sortDescending());
    this.loadAuctions();
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  getStatusConfig(statusStr: string) {
    const map: Record<string, { label: string; bgClass: string; textClass: string; icon: string }> = {
      Upcoming: { label: 'قادم',   bgClass: 'bg-blue-50',   textClass: 'text-blue-700',  icon: 'schedule'     },
      Active:   { label: 'جارٍ',   bgClass: 'bg-green-50',  textClass: 'text-green-700', icon: 'play_circle'  },
      Ended:    { label: 'منتهي',  bgClass: 'bg-red-50',    textClass: 'text-red-600',   icon: 'check_circle' },
      Canceled: { label: 'ملغي',   bgClass: 'bg-yellow-50', textClass: 'text-yellow-700',icon: 'cancel'       },
      // Failed: { label: 'انتهي ',   bgClass: 'bg-yellow-50', textClass: 'text-yellow-700',icon: 'cancel'       },
    };
    return map[statusStr] ?? { label: statusStr, bgClass: 'bg-gray-100', textClass: 'text-gray-600', icon: 'info' };
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(price);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  trackById(_: number, item: Auction): number {
    return item.id;
  }
}