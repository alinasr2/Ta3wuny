import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Shop } from './pages/shop/shop';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Product } from './pages/product/product';
import { Chat } from './pages/chat/chat';
import { Cart } from './pages/cart/cart';
import { Profile } from './pages/profile/profile';
import { Farmers } from './pages/farmers/farmers';
import { Farmer } from './pages/farmer/farmer';
import { Community } from './pages/community/community';
import { Auctions } from './pages/auctions/auctions';
import { Trader } from './pages/trader/trader';
import { Traders } from './pages/traders/traders';
import { Auction } from './pages/auction/auction';
import { TraderProfile } from './shared/components/trader-profile/trader-profile';
import { guestGuard } from './core/guards/guest-guard';
import { isLoginGuard } from './core/guards/is-login-guard';

import { Checkout } from './pages/checkout/checkout';
import { OrderConfirmation } from './pages/order-confirmation/order-confirmation';
import { MyOrders } from './pages/my-orders/my-orders';
import { CompleteFarmerProfile } from './pages/complete-farmer-profile/complete-farmer-profile';
import { CompleteTraderProfile } from './pages/complete-trader-profile/complete-trader-profile';

export const routes: Routes = [
  // Public routes
  { path: 'farmers', component: Farmers },
  { path: 'farmer/:id', component: Farmer },
  { path: 'traders', component: Traders },
  { path: 'trader/:id', component: Trader },
  { path: 'community', component: Community },
  { path: '', component: Home },
  { path: 'marketplace', component: Shop },
  { path: 'auctions', component: Auctions },
  { path: 'auctions/:id', component: Auction },
  { path: 'product', component: Product },

  // Auth pages
  { path: 'register', component: Register, canActivate: [guestGuard] },
  { path: 'login', component: Login, canActivate: [guestGuard] },

  // Protected routes
  { path: 'chat', component: Chat, canActivate: [isLoginGuard] },
  { path: 'cart', component: Cart, canActivate: [isLoginGuard] },
  { path: 'profile', component: Profile, canActivate: [isLoginGuard] },
  { path: 'checkout', component: Checkout },
  { path: 'order-confirmation/:id', component: OrderConfirmation },
  { path: 'my-orders', component: MyOrders, canActivate: [isLoginGuard] },
  {
    path: 'complete-farmer-profile',
    component: CompleteFarmerProfile,
    canActivate: [isLoginGuard],
  },
  {
    path: 'complete-trader-profile',
    component: CompleteTraderProfile,
    canActivate: [isLoginGuard],
  },
];
