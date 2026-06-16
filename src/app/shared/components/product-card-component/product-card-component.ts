import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-card-component',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card-component.html',
  styleUrl: './product-card-component.scss',
})
export class ProductCardComponent {
  @Input() product: any = {};


  ngOnChanges(changes: any): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    console.log(this.product);
    
  }


  get formattedPrice(): string {
    return `${this.product?.unitPrice || 0} جنيه`;
  }

  get farmerDisplayName(): string {
    return this.product?.farmerName || 'مزارع';
  }
  

  get rating(): string {
    return (this.product?.rating || 4.5).toFixed(1);
  }
  
  get badgeText(): string {
    if (this.product?.hasActiveAuction) {
      return 'مزاد نشط';
    }
    return 'حصاد طازج';
  }
  
  /**
   * الحصول على رابط الصورة
   */
  get imageUrl(): string {
    return this.product?.mainImageUrl || 'https://placehold.co/400x300?text=No+Image';
  }
  
  /**
   * الحصول على الموقع (محافظة - مدينة)
   */
  get location(): string {
    const governorate = this.product?.farmerGovernorate;
    const city = this.product?.farmerCity;
    if (governorate && city) {
      return `${city}، ${governorate}`;
    }
    return city || governorate || 'مصر';
  }
}
