export interface IBasketItem {
  id: number;
  productId: number;
  productName: string;
  pictureUrl: string;
  price: number;
  quantity: number;
}

export interface IBasket {
  id: string;
  items: IBasketItem[];
  deliveryMethodId?: number;
  shippingPrice?: number;
  paymentIntentId?: string;
  clientSecret?: string;
}

export interface IBasketResponse {
  isSuccess: boolean;
  message: string;
  data: IBasket;
  errors: string[] | null;
}
