export interface IFarmer {
  farmerId: string
  name: string
  farmName: string
  description: string
  email: string
  userName: string
  address: Address
  profileImageUrl: string
  joinDate: string
  isVerified: boolean
  messsage: any
}

export interface Address {
  id: number
  userId: string
  street: string
  city: string
  governorate: string
  postalCode: any
  country: string
  latitude: number
  longitude: number
}
