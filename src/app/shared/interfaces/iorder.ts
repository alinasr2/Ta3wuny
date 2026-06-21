// ① طرق الدفع
export enum PaymentMethod {
  CashOnDelivery = 0,
  BankTransfer = 1,
  Wallet = 2,
  Card = 3,
}

// ② حالات الدفع
export enum PaymentStatus {
  Unpaid = 0,
  Paid = 1,
  Refunded = 2,
  Failed = 3,
}

// ③ الـ request بتاع إنشاء الطلب
export interface ICreateOrder {
  notes: string;
  paymentMethod: PaymentMethod;
  basketId: string;
}

// ④ item في الطلب
export interface IOrderItem {
  productId: number;
  productName: string;
  mainImageUrl: string;
  quantity: number;
  unit: string;
  unitPriceAtOrder: number;
  subtotal: number;
}

// ⑤ الطلب المختصر — في القائمة وفي POST response
export interface IOrder {
  id: number;
  buyerName: string;
  buyerId: string;
  total: number;
  status: string;
  paymentStatus: number;      // ← رقم مش string
  items: IOrderItem[];
  logisticsStatus: string;
}

// ⑥ تفاصيل الطلب الكاملة
export interface IOrderDetails {
  id: number;
  buyerName: string;
  buyerId: string;
  buyerEmail: string;
  farmerName: string;         // ← أضيف
  farmerId: string;           // ← أضيف
  farmerEmail: string;        // ← أضيف
  orderDate: string;
  total: number;
  status: string;
  notes: string;
  deliveryMethod: IDeliveryMethod | null;
  items: IOrderItem[];
  logistics: IOrderLogistics | null;
  payment: IOrderPayment | null;
}

// ⑦ طريقة الشحن
export interface IDeliveryMethod {
  id: number;
  shortName: string;
  description: string;
  cost: number;
  deliveryTime: string;
}

// ⑧ اللوجستيات
export interface IOrderLogistics {
  logisticsId: number;
  logisticsStatus: number;    // ← رقم مش string
  estimatedDelivery: string;
  notes: string;
}

// ⑨ الدفع
export interface IOrderPayment {
  id: number;
  paymentStatus: number;      // ← رقم
  paymentMethod: number;      // ← رقم
  paymentIntentId: string;
}

// ⑩ طرق الشحن الثابتة
export const DELIVERY_METHODS: IDeliveryMethod[] = [
  { id: 1, shortName: 'UPS1', description: 'أسرع وقت توصيل', deliveryTime: 'من يوم لـ يومين', cost: 100 },
  { id: 2, shortName: 'UPS2', description: 'أحصل عليها في خمس أيام', deliveryTime: 'من يومين لـ أربع أيام', cost: 55 },
  { id: 3, shortName: 'UPS3', description: 'أبطأ لكن أرخص', deliveryTime: 'من أربع أيام لـ أسبوع', cost: 30 },
  { id: 4, shortName: 'FREE', description: 'ادفع على ما تحصل عليه فقط', deliveryTime: 'من أسبوع لـ عشر أيام', cost: 0 },
];

// ⑪ maps للعرض
export const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  Pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700' },
  Confirmed: { label: 'مؤكد', color: 'bg-blue-100 text-blue-700' },
  Preparing: { label: 'جاري التجهيز', color: 'bg-blue-100 text-blue-700' },
  ReadyForPickup: { label: 'جاهز للشحن', color: 'bg-purple-100 text-purple-700' },
  InDelivery: { label: 'في الطريق', color: 'bg-orange-100 text-orange-700' },
  Delivered: { label: 'تم التوصيل', color: 'bg-green-100 text-green-700' },
  Cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700' },
  Rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700' },
};

export const PAYMENT_STATUS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: 'لم يتم الدفع', color: 'bg-gray-100 text-gray-700' },
  1: { label: 'تم الدفع', color: 'bg-green-100 text-green-700' },
  2: { label: 'مسترد', color: 'bg-blue-100 text-blue-700' },
  3: { label: 'فشل الدفع', color: 'bg-red-100 text-red-700' },
};

export const PAYMENT_METHOD_MAP: Record<number, string> = {
  0: 'الدفع عند الاستلام',
  1: 'تحويل بنكي',
  2: 'محفظة إلكترونية',
  3: 'بطاقة ائتمان',
};

export const LOGISTICS_STATUS_MAP: Record<number, string> = {
  0: 'لم يُجدول',
  1: 'مجدول',
  2: 'تم الاستلام',
  3: 'في الطريق',
  4: 'تم التوصيل',
  5: 'فشل',
};