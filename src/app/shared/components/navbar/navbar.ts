import { isPlatformBrowser } from '@angular/common';
import { Component, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../core/services/auth/auth';
import { BasketService } from '../../../core/services/basket/basket-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private authState = inject(Auth);
  private ID: any = inject(PLATFORM_ID);
  isLoggedIn = this.authState.isLoggedIn;
  isSidebarOpen = false;
  isMobileScreen: boolean = false;
  private basketService = inject(BasketService);
  private sub = new Subscription();
  cartItemCount = 0;

  ngOnInit() {
    this.checkScreenSize();
    this.sub.add(
      this.basketService.basket.subscribe((basket) => {
        this.cartItemCount = basket?.items.length ?? 0;
      }),
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private checkScreenSize() {
    if (isPlatformBrowser(this.ID)) {
      this.isMobileScreen = window.innerWidth < 768;
    }
    if (!this.isMobileScreen && this.isSidebarOpen) {
      this.isSidebarOpen = false;
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  isVisible = true;
  lastScrollY = 0;

  @HostListener('window:scroll')
  onScroll() {
    const currentScrollY = window.scrollY;

    if (currentScrollY < 100) {
      this.isVisible = true;
    } else if (currentScrollY > this.lastScrollY) {
      this.isVisible = false;
    } else {
      this.isVisible = true;
    }

    this.lastScrollY = currentScrollY;
  }

  private router = inject(Router);

  logOut() {
    this.authState.Logout().subscribe({
      next: (res) => {
        this.router.navigate(['/']);
      },
    });
  }
}
