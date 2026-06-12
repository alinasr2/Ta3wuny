export interface Iproduct {
  id: number;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  harvestDate: string;
  expiryDate: string;
  status: number;
  createdAt: string;
  categoryId: number;
  categoryName: string;
  farmerId: string;
  farmerName: string;
  farmerGovernorate: string;
  farmerCity: string;
  imageUrls: string[];
  mainImageUrl: string;
  hasActiveAcution: boolean;
}
