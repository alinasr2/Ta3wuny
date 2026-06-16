import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Users } from '../../core/services/users/users';
import { Itrader } from '../../shared/interfaces/itrader';

@Component({
  selector: 'app-traders',
  imports: [CommonModule, RouterLink],
  templateUrl: './traders.html',
  styleUrl: './traders.scss',
})
export class Traders implements OnInit {
  private readonly usersService = inject(Users);
  private cdr = inject(ChangeDetectorRef);

  traders: Itrader[] = [];
  filteredTraders: Itrader[] = [];
  isLoading: boolean = true;

  ngOnInit() {
    this.isLoading = true;

    this.usersService.getAllTraders().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.traders = res.data;
          this.filteredTraders = res.data;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredTraders = this.traders.filter(
      (t) =>
        t.name?.toLowerCase().includes(query) ||
        t.businessName?.toLowerCase().includes(query) ||
        t.address?.city?.toLowerCase().includes(query),
    );
  }
}
