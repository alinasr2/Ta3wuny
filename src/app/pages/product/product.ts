import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BasketService } from '../../core/services/basket/basket-service';
import { IBasketItem } from '../../shared/interfaces/ibasket';

@Component({
  selector: 'app-product',
  imports: [CommonModule, FormsModule],
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class Product {
  private basketService = inject(BasketService);
  added = false;
  addToCart() {
    const item: IBasketItem = {
      id: 2,
      productId: 3,
      productName: 'طماطم',
      pictureUrl: this.selectedImage.src,
      price: 200,
      quantity: this.quantity,
    };
    this.basketService.addItemToBasket(item);

    this.added = true;
    setTimeout(() => (this.added = false), 2000);
  }

  galleryImages = [
    {
      src: 'https://placehold.co/600x400/22c55e/white?text=Main+View',
      alt: 'Main wheat product view',
    },
    { src: 'https://placehold.co/600x400/15803d/white?text=View+2', alt: 'Wheat grain closeup' },
    { src: 'https://placehold.co/600x400/166534/white?text=View+3', alt: 'Wheat field harvest' },
    { src: 'https://placehold.co/600x400/14532d/white?text=View+4', alt: 'Packaging display' },
  ];

  selectedImage = this.galleryImages[0];

  // Features Data
  features = [
    '100% Organic Certified',
    'Non-GMO Project Verified',
    'Sustainably Farmed',
    'Lab Tested for Purity',
  ];

  // Reviews Data
  reviews = [
    {
      userName: 'Ahmed Salama',
      date: 'Oct 12, 2025',
      comment: 'The quality of the grains is exceptional, very clean packaging.',
      rating: 5,
    },
    {
      userName: 'John Doe',
      date: 'Sep 30, 2025',
      comment: 'Fast delivery and the organic certification is legit. Highly recommended.',
      rating: 4,
    },
    {
      userName: 'Sara Ali',
      date: 'Aug 15, 2025',
      comment: 'Best wheat for sourdough bread making!',
      rating: 5,
    },
  ];

  // Quantity Data
  quantity: number = 1;

  // Computed Property for Average Rating
  get averageRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / this.reviews.length;
  }

  // Methods
  changeQuantity(delta: number) {
    const newValue = this.quantity + delta;
    if (newValue >= 1 && newValue <= 1000) {
      this.quantity = newValue;
    }
  }

  validateQuantity() {
    if (this.quantity < 1) this.quantity = 1;
    if (this.quantity > 1000) this.quantity = 1000;
  }
}
