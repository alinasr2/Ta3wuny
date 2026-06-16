// src/app/shared/interfaces/iorder.ts

// ① طرق الدفع
export enum PaymentMethod {
  CashOnDelivery = 0,
  BankTransfer = 1,
  Wallet = 2,
  Card = 3,
}

// ② الـ request بتاع إنشاء الطلب — 3 fields بس
export interface ICreateOrder {
  notes: string;
  paymentMethod: PaymentMethod;
  basketId: string;
}

// ③ item في الطلب
export interface IOrderItem {
  productId: number;
  productName: string;
  mainImageUrl: string;
  quantity: number;
  unit: string;
  unitPriceAtOrder: number;
  subtotal: number;
}

// ④ الطلب المختصر — في القائمة وفي POST response
export interface IOrder {
  id: number;
  buyerName: string;
  buyerId: string;
  total: number;
  status: string;
  paymentStatus: string;
  items: IOrderItem[];
  logisticsStatus: string;
}

// ⑤ تفاصيل الطلب الكاملة — في GET /Orders/{id}
export interface IOrderDetails {
  id: number;
  buyerName: string;
  buyerId: string;
  buyerEmail: string;
  orderDate: string;
  total: number;
  status: string;
  notes: string;
  deliveryMethod: IDeliveryMethod | null;
  items: IOrderItem[];
  logistics: IOrderLogistics | null;
  payment: IOrderPayment | null;
}

// ⑥ طريقة الشحن
export interface IDeliveryMethod {
  id: number;
  shortName: string;
  description: string;
  cost: number;
  deliveryTime: string;
}

// ⑦ اللوجستيات
export interface IOrderLogistics {
  logisticsId: number;
  logisticsStatus: string;
  estimatedDelivery: string;
  notes: string;
}

// ⑧ الدفع
export interface IOrderPayment {
  id: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentIntentId: string;
}

// ⑨ طرق الشحن الثابتة في الـ app
export const DELIVERY_METHODS: IDeliveryMethod[] = [
  {
    id: 1,
    shortName: 'UPS1',
    description: 'أسرع وقت توصيل',
    deliveryTime: 'من يوم لـ يومين',
    cost: 100,
  },
  {
    id: 2,
    shortName: 'UPS2',
    description: 'أحصل عليها في خمس أيام',
    deliveryTime: 'من يومين لـ أربع أيام',
    cost: 55,
  },
  {
    id: 3,
    shortName: 'UPS3',
    description: 'أبطأ لكن أرخص',
    deliveryTime: 'من أربع أيام لـ أسبوع',
    cost: 30,
  },
  {
    id: 4,
    shortName: 'FREE',
    description: 'ادفع على ما تحصل عليه فقط',
    deliveryTime: 'من أسبوع لـ عشر أيام',
    cost: 0,
  },
];
