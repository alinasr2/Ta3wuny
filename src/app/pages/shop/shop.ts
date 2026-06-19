import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from "../../shared/components/product-card-component/product-card-component";
import { ProductsService } from '../../core/services/products/products-service';
import { MatFormField, MatLabel, MatSelect, MatOption } from "@angular/material/select";

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, MatFormField, MatLabel, MatSelect, MatOption],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
})
export class Shop implements OnInit {
  private productsService = inject(ProductsService);
  isLoading = signal(true);
  
  categories = signal<any[]>([]);
  products = signal<any[]>([]);
  
  paginationInfo = signal({
    pageIndex: 1,
    pageSize: 12,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  
  filters = signal<any>({
    pageIndex: 1,
    pageSize: 12,
    search: '',
    sort: 'newest',
    sortDescending: true
  });
  
  searchQuery = signal('');
  selectedCategories = signal<number[]>([]);
  priceRange = signal({ min: 0, max: 1000 });
  tempPriceRange = signal({ min: 0, max: 1000 });
  sortOptions = [
    { value: 'newest', label: 'الأحدث أولاً', sortBy: 'createdAt', descending: true },
    { value: 'price_asc', label: 'السعر: من الأقل إلى الأعلى', sortBy: 'price', descending: false },
    { value: 'price_desc', label: 'السعر: من الأعلى إلى الأقل', sortBy: 'price', descending: true },
    { value: 'name_asc', label: 'الاسم: من أ إلى ي', sortBy: 'name', descending: false },
    { value: 'name_desc', label: 'الاسم: من ي إلى أ', sortBy: 'name', descending: true }
  ];
  
  totalItems = computed(() => this.paginationInfo().totalCount);
  currentPage = computed(() => this.paginationInfo().pageIndex);
  totalPages = computed(() => this.paginationInfo().totalPages);
  hasNextPage = computed(() => this.paginationInfo().hasNextPage);
  hasPreviousPage = computed(() => this.paginationInfo().hasPreviousPage);
  
  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
      } else if (current >= total - 2) {
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        for (let i = current - 2; i <= current + 2; i++) pages.push(i);
      }
    }
    return pages;
  });
  
  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }
  
  loadCategories(): void {
    this.productsService.getAllCategories().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.categories.set(response.data);
        }
      },
      error: (error) => {
        console.error('خطأ في جلب الفئات:', error);
      }
    });
  }
  
  loadProducts(): void {
    this.isLoading.set(true);
    
    const currentFilters = this.filters();
    const currentPrice = this.priceRange();
    
    const params: any = {
      ...currentFilters,
      minPrice: currentPrice.min > 0 ? currentPrice.min : undefined,
      maxPrice: currentPrice.max < 1000 ? currentPrice.max : undefined,
      categoryId: this.selectedCategories().length === 1 ? this.selectedCategories()[0] : undefined
    };
    
    this.productsService.getProducts(params).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.products.set(response.data.data);
          this.paginationInfo.set({
            pageIndex: response.data.pageIndex,
            pageSize: response.data.pageSize,
            totalCount: response.data.count,
            totalPages: response.data.totalPages,
            hasNextPage: response.data.hasNextPage,
            hasPreviousPage: response.data.hasPreviousPage
          });
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('خطأ في جلب المنتجات:', error);
        this.isLoading.set(false);
      }
    });
  }
  
  toggleCategory(categoryId: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const currentSelected = this.selectedCategories();
    
    if (isChecked) {
      this.selectedCategories.set([...currentSelected, categoryId]);
    } else {
      this.selectedCategories.set(currentSelected.filter(id => id !== categoryId));
    }
    
    this.resetPageAndReload();
  }

  onSortChange(sortValue: string): void {
    const selectedSort = this.sortOptions.find(opt => opt.value === sortValue);
    if (selectedSort) {
      this.filters.update(f => ({
        ...f,
        sort: selectedSort.sortBy,
        sortDescending: selectedSort.descending,
        pageIndex: 1
      }));
      this.loadProducts();
    }
  }
  

  onPriceRangeChange(): void {
    this.priceRange.set({ ...this.tempPriceRange() });
    this.resetPageAndReload();
  }
  

  onSearch(): void {
    this.filters.update(f => ({
      ...f,
      search: this.searchQuery(),
      pageIndex: 1
    }));
    this.loadProducts();
  }

  resetAllFilters(): void {
    this.searchQuery.set('');
    this.selectedCategories.set([]);
    this.priceRange.set({ min: 0, max: 1000 });
    this.tempPriceRange.set({ min: 0, max: 1000 });
    this.filters.set({
      pageIndex: 1,
      pageSize: 12,
      search: '',
      sort: 'newest',
      sortDescending: true
    });
    this.loadProducts();
  }
  

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.filters.update(f => ({ ...f, pageIndex: page }));
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  

  nextPage(): void {
    if (this.hasNextPage()) {
      this.goToPage(this.currentPage() + 1);
    }
  }
  

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  private resetPageAndReload(): void {
    this.filters.update(f => ({ ...f, pageIndex: 1 }));
    this.loadProducts();
  }

  getCategoryName(category:any): string {
    return category.nameAr || category.name;
  }

  getSortValue(): string {
    const f = this.filters();

    if (f.sort === 'createdAt') return 'newest';

    if (f.sort === 'price' && !f.sortDescending) return 'price_asc';

    if (f.sort === 'price' && f.sortDescending) return 'price_desc';

    if (f.sort === 'name' && !f.sortDescending) return 'name_asc';

    return 'newest';
  }
}