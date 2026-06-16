import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy, effect } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Product implements OnInit {
  private basketService = inject(BasketService);
  private productService = inject(ProductsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  product = signal<Iproduct | null>(null);
  selectedImage = signal<string>('');
  quantity = signal<number>(1);
  added = signal<boolean>(false);
  isLoading = signal<boolean>(true);

  isQuantityValid = computed(() => {
    const currentProduct = this.product();
    const currentQuantity = this.quantity();
    return currentQuantity >= 1 && currentQuantity <= (currentProduct?.quantity ?? 1000);
  });

  ngOnInit() {
    this.isLoading.set(true);
    const id = this.route.snapshot.queryParamMap.get('id');
    
    if (!id) {
      this.router.navigate(['/marketplace']);
      return;
    }

    this.productService.getProductById(+id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.product.set(res.data);
          this.selectedImage.set(res.data.mainImageUrl);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/marketplace']);
      },
    });
  }

  selectImage(url: string) {
    this.selectedImage.set(url);
  }

  changeQuantity(delta: number) {
    const currentProduct = this.product();
    if (!currentProduct) return;

    const newValue = this.quantity() + delta;
    if (newValue >= 1 && newValue <= (currentProduct.quantity ?? 1000)) {
      this.quantity.set(newValue);
    }
  }

  addToCart() {
    const currentProduct = this.product();
    if (!currentProduct) return;

    const item: IBasketItem = {
      id: 0,
      productId: currentProduct.id,
      productName: currentProduct.name,
      pictureUrl: currentProduct.mainImageUrl,
      price: currentProduct.unitPrice,
      quantity: this.quantity(),
    };

    this.basketService.addItemToBasket(item);
    this.added.set(true);
    
    setTimeout(() => {
      this.added.set(false);
    }, 2000);
  }

  goBack() {
    this.router.navigate(['/marketplace']);
  }

  get productValue() {
    return this.product();
  }

  get selectedImageValue() {
    return this.selectedImage();
  }

  get quantityValue() {
    return this.quantity();
  }

  get addedValue() {
    return this.added();
  }

  get isLoadingValue() {
    return this.isLoading();
  }
}