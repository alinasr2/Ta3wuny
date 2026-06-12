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
  
  /**
   * تنسيق السعر مع العملة
   */
  get formattedPrice(): string {
    return `${this.product?.unitPrice || 0} جنيه`;
  }
  
  /**
   * الحصول على اسم المزارع أو عرض "مزارع"
   */
  get farmerDisplayName(): string {
    return this.product?.farmerName || 'مزارع';
  }
  
  /**
   * الحصول على التقييم الوهمي أو قيمة افتراضية
   */
  get rating(): string {
    // يمكن جلب التقييم من API آخر أو جعله وهمياً
    return (this.product?.rating || 4.5).toFixed(1);
  }
  
  /**
   * هل المنتج عليه عرض أو جديد؟
   */
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
