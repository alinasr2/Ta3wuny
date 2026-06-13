import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Shop } from './pages/shop/shop';
import { Contact } from './pages/contact/contact';
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

export const routes: Routes = [
    {path:"",component:Home},
    {path:"marketplace", component:Shop},
    {path:'contact' , component:Contact},
    {path:"register",component:Register},
    {path:"login",component:Login},
    {path:"product",component:Product},
    {path:"chat",component:Chat},
    {path:"cart",component:Cart},
    {path:"profile",component:Profile},
    {path:"farmers",component:Farmers},
    {path:"farmer/:id",component:Farmer},
    {path:"community",component:Community},
    {path:"auctions",component:Auctions}
];
