import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuctionsService } from '../../core/services/Auctions/auctions';
import * as signalR from '@microsoft/signalr';
import { BaseUrl } from '../../shared/environments/base-url';

export interface Bid {
  id: number;
  bidderId: string;
  bidderName: string;
  bidderImage: string;
  amount: number;
  isWinning: boolean;
  bidTime: string;
}

export interface AuctionDetail {
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
  bids: Bid[];
}

@Component({
  selector: 'app-auction',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    RouterLink
  ],
  templateUrl: './auction.html',
  styleUrl: './auction.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Auction implements OnInit, OnDestroy {
  private readonly auctionsService = inject(AuctionsService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  // State
  auction = signal<AuctionDetail | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  auctionId = signal<number>(0);

  // Bid form
  bidAmount = signal<number | null>(null);
  bidLoading = signal(false);
  bidError = signal<string | null>(null);

  // SignalR
  private hubConnection: signalR.HubConnection | null = null;
  isConnected = signal(false);
  liveActivity = signal(false); // flash effect on new bid

  // Computed
  statusConfig = computed(() => {
    const s = this.auction()?.status ?? '';
    const map: Record<string, { label: string; bgClass: string; textClass: string; icon: string; dotClass: string }> = {
      Ended:    { label: 'منتهي',  bgClass: 'bg-red-50',    textClass: 'text-red-600',    icon: 'check_circle',  dotClass: 'bg-red-400'    },
      Active:   { label: 'جارٍ',   bgClass: 'bg-green-50',  textClass: 'text-green-700',  icon: 'play_circle',   dotClass: 'bg-green-500'  },
      Upcoming: { label: 'قادم',   bgClass: 'bg-blue-50',   textClass: 'text-blue-700',   icon: 'schedule',      dotClass: 'bg-blue-400'   },
      Canceled: { label: 'ملغي',   bgClass: 'bg-yellow-50', textClass: 'text-yellow-700', icon: 'cancel',        dotClass: 'bg-yellow-400' },
    };
    return map[s] ?? { label: s, bgClass: 'bg-gray-100', textClass: 'text-gray-600', icon: 'info', dotClass: 'bg-gray-400' };
  });

  sortedBids = computed(() =>
    [...(this.auction()?.bids ?? [])].sort(
      (a, b) => new Date(b.bidTime).getTime() - new Date(a.bidTime).getTime()
    )
  );

  minBidAmount = computed(() => {
    const a = this.auction();
    if (!a) return 0;
    return Math.ceil(a.currentPrice + 1);
  });

  canBid = computed(() => {
    const a = this.auction();
    return a && !a.isEnded && a.status === 'Active';
  });

  priceIncreasePercent = computed(() => {
    const a = this.auction();
    if (!a || a.startingPrice === 0) return 0;
    return (((a.currentPrice - a.startingPrice) / a.startingPrice) * 100).toFixed(1);
  });

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      const id = Number(params.get('id') ?? 0);
      this.auctionId.set(id);
      this.loadAuction(id);
    });
  }

  loadAuction(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.auctionsService.getAuctionById(id).subscribe({
      next: (res) => {
        console.log(res);
        
        if (res?.isSuccess) {
          this.auction.set(res.data);
          this.bidAmount.set(this.minBidAmount());
          this.connectSignalR(id);
        } else {
          this.error.set(res?.message ?? 'حدث خطأ ما');
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('تعذّر الاتصال بالخادم');
        this.loading.set(false);
      },
    });
  }

  // ─── SignalR ───────────────────────────────────────────
  connectSignalR(auctionId: number): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${BaseUrl.url}hubs/auction`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('bidplaced', (data: any) => {
      this.onNewBid(data);
    });

    this.hubConnection
      .start()
      .then(() => {
        this.isConnected.set(true);
        this.hubConnection!.invoke('joinauction', auctionId);
      })
      .catch(() => this.isConnected.set(false));

    this.hubConnection.onreconnected(() => {
      this.isConnected.set(true);
      this.hubConnection!.invoke('joinauction', auctionId);
    });

    this.hubConnection.onclose(() => this.isConnected.set(false));
  }

  onNewBid(data: any): void {
    // Flash live activity
    this.liveActivity.set(true);
    setTimeout(() => this.liveActivity.set(false), 1500);

    // Update auction state
    this.auction.update((prev) => {
      if (!prev) return prev;
      const newBid: Bid = {
        id: Date.now(),
        bidderId: data.bidderId ?? '',
        bidderName: data.bidderName ?? 'مستخدم',
        bidderImage: '',
        amount: data.amount,
        isWinning: true,
        bidTime: data.bidTime ?? new Date().toISOString(),
      };
      // Mark old winning bids as not winning
      const updatedBids = prev.bids.map((b) => ({ ...b, isWinning: false }));
      return {
        ...prev,
        currentPrice: data.currentPrice ?? data.amount,
        totalBids: prev.totalBids + 1,
        bids: [...updatedBids, newBid],
      };
    });

    this.bidAmount.set(this.minBidAmount());
  }

  // ─── Place Bid ────────────────────────────────────────
  placeBid(): void {
    const amount = this.bidAmount();
    if (!amount || amount < this.minBidAmount()) {
      this.bidError.set(`المبلغ يجب أن يكون أكبر من ${this.formatPrice(this.auction()?.currentPrice ?? 0)}`);
      return;
    }

    this.bidLoading.set(true);
    this.bidError.set(null);

    this.auctionsService.placeBid(this.auctionId(), { amount }).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.snackBar.open('✅ تم تقديم مزايدتك بنجاح', 'إغلاق', {
            duration: 3000,
            panelClass: ['snack-success'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        } else {
          this.bidError.set(res?.message ?? 'فشل تقديم المزايدة');
        }
        this.bidLoading.set(false);
      },
      error: () => {
        this.bidError.set('حدث خطأ، يرجى المحاولة مرة أخرى');
        this.bidLoading.set(false);
      },
    });
  }

  // ─── Helpers ──────────────────────────────────────────
  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('ar-EG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getAvatarUrl(url: string): string {
    return url && url !== 'https://t3awuny.runasp.net' ? url : '';
  }

  trackById(_: number, item: Bid): number {
    return item.id;
  }

  ngOnDestroy(): void {
    const id = this.auctionId();
    if (this.hubConnection && id) {
      this.hubConnection.invoke('leaveauction', id).finally(() => {
        this.hubConnection?.stop();
      });
    }
  }
}