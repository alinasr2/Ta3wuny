export interface ITraderAddress {
  id: number;
  userId: string;
  street: string;
  city: string;
  governorate: string;
  postalCode: number;
  country: string;
  latitude: number;
  longitude: number;
}

export interface Itrader {
  traderId: string;
  name: string | null;
  businessName: string | null;
  businessType: string;
  description: string;
  email: string;
  userName: string;
  address: ITraderAddress | null;
  profileImageUrl: string;
  taxNumber: number;
  joinDate: string;
  isVerified: boolean;
  messsage: string;
}
