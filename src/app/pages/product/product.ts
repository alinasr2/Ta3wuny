import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BasketService } from '../../core/services/basket/basket-service';
import { IBasketItem } from '../../shared/interfaces/ibasket';
import { ProductsService } from '../../core/services/products/products-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Iproduct } from '../../shared/interfaces/iproduct';

@Component({
  selector: 'app-product',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class Product implements OnInit {
  private basketService = inject(BasketService);
  private productService = inject(ProductsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  product: Iproduct | null = null;
  selectedImage: string = '';
  quantity: number = 1;
  added = false;
  isLoading = true;

  ngOnInit() {
    this.isLoading = true;
    const id = this.route.snapshot.queryParamMap.get('id');
    if (!id) {
      this.router.navigate(['/marketplace']);
      return;
    }
    this.productService.getProductById(+id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.product = res.data;
          this.selectedImage = res.data.mainImageUrl;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching product:', err);
        this.isLoading = false;
        this.router.navigate(['/marketplace']);
      },
    });
  }

  selectImage(url: string) {
    this.selectedImage = url;
  }

  changeQuantity(delta: number) {
    const newValue = this.quantity + delta;
    if (newValue >= 1 && newValue <= (this.product?.quantity ?? 1000)) {
      this.quantity = newValue;
    }
  }

  addToCart() {
    if (!this.product) return;

    const item: IBasketItem = {
      id: 0,
      productId: this.product.id,
      productName: this.product.name,
      pictureUrl: this.product.mainImageUrl,
      price: this.product.unitPrice,
      quantity: this.quantity,
    };
    this.basketService.addItemToBasket(item);
    this.added = true;
    setTimeout(() => (this.added = false), 2000);
  }

  goBack() {
    this.router.navigate(['/marketplace']);
  }
}
