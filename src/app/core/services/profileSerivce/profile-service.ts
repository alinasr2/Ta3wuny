import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseUrl } from '../../../shared/environments/base-url';

export interface ApiResponse<T = any> {
  isSuccess: boolean;
  message: string;
  data: T;
  errors: string[];
}

export interface Auction {
  id: number;
  productId: number;
  status: string;
  startDate: string;
  endDate: string;
  startingPrice: number;
  reservePrice: number;
  currentPrice: number;
  isEnded: boolean;
  minutesRemaining: number;
}

export interface Product {
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

export interface ProductsResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: Product[];
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);


  getMyAuctions(): Observable<ApiResponse<Auction[]>> {
    /*
    response
    {
      "isSuccess": true,
      "message": "string",
      "data": [
        {
          "id": 0,
          "productId": 0,
          "status": "string",
          "startDate": "2026-06-14T21:41:34.838Z",
          "endDate": "2026-06-14T21:41:34.838Z",
          "startingPrice": 0,
          "reservePrice": 0,
          "currentPrice": 0,
          "isEnded": true,
          "minutesRemaining": 0
        }
      ],
      "errors": [
        "string"
      ]
    }
    */
    return this.http.get<ApiResponse<Auction[]>>(`${BaseUrl.url}api/Auctions/my`)
  }

  getMyProfileFarmer():Observable<any>
  {
    /*
      {
  "isSuccess": true,
  "message": "string",
  "data": {
    "farmerId": "string",
    "name": "string",
    "farmName": "string",
    "description": "string",
    "email": "string",
    "userName": "string",
    "address": {
      "id": 0,
      "userId": "string",
      "street": "string",
      "city": "string",
      "governorate": "string",
      "postalCode": 0,
      "country": "string",
      "latitude": 0,
      "longitude": 0
    },
    "profileImageUrl": "string",
    "joinDate": "2026-06-14T21:43:40.210Z",
    "isVerified": true,
    "messsage": "string"
  },
  "errors": [
    "string"
  ]
}
    */
    return this.http.get(`${BaseUrl.url}api/Farmers/farmer-profile`);
  }

  addMyProfileFarmer(formData:object):Observable<any>
  {
    // if the current loged farmer who create the profile you can ignore the userId
    /**
     * request body
     * {
        "userId": "string",
        "farmName": "string",
        "description": "string"
      }
        response
        {
          "isSuccess": true,
          "message": "string",
          "data": {
            "farmerId": "string",
            "name": "string",
            "farmName": "string",
            "description": "string",
            "email": "string",
            "userName": "string",
            "address": {
              "id": 0,
              "userId": "string",
              "street": "string",
              "city": "string",
              "governorate": "string",
              "postalCode": 0,
              "country": "string",
              "latitude": 0,
              "longitude": 0
            },
            "profileImageUrl": "string",
            "joinDate": "2026-06-14T21:48:15.561Z",
            "isVerified": true,
            "messsage": "string"
          },
          "errors": [
            "string"
          ]
        }
     */
    return this.http.post(`${BaseUrl.url}api/Farmers/farmer-profile`,formData)
  }

  editMyProfileFarmer(formData:object):Observable<any>
  {
    /*
      request body
      {
        "userId": "string",
        "name": "string",
        "farmName": "string",
        "description": "string"
      }

      response
      {
  "isSuccess": true,
  "message": "string",
  "data": {
    "farmerId": "string",
    "name": "string",
    "farmName": "string",
    "description": "string",
    "email": "string",
    "userName": "string",
    "address": {
      "id": 0,
      "userId": "string",
      "street": "string",
      "city": "string",
      "governorate": "string",
      "postalCode": 0,
      "country": "string",
      "latitude": 0,
      "longitude": 0
    },
    "profileImageUrl": "string",
    "joinDate": "2026-06-14T21:48:15.525Z",
    "isVerified": true,
    "messsage": "string"
  },
  "errors": [
    "string"
  ]
}
    */
    return this.http.put(`${BaseUrl.url}api/Farmers/farmer-profile`,formData);
  }

  getMyOrdersFarmer():Observable<any>
  {
    /**
     * response
     * {
  "isSuccess": true,
  "message": "string",
  "data": [
        {
          "id": 0,
          "buyerName": "string",
          "buyerId": "string",
          "total": 0,
          "status": "string",
          "paymentStatus": "string",
          "items": [
            {
              "productId": 0,
              "productName": "string",
              "mainImageUrl": "string",
              "quantity": 0,
              "unit": "string",
              "unitPriceAtOrder": 0,
              "subtotal": 0
            }
          ],
          "logisticsStatus": "string"
        }
      ],
      "errors": [
        "string"
      ]
    }
     */
    return this.http.get(`${BaseUrl.url}api/Orders/my/farmer`)
  }

  confirmOrder(orderId:any):Observable<any>
  {
    /**
     * response
        * {
      "isSuccess": true,
      "message": "string",
      "data": "string",
      "errors": [
              "string"
            ]
      }
     */
    return this.http.patch(`${BaseUrl.url}api/Orders/${orderId}/confirm`,{})
  }

  rejectOrder(orderId:any,reason:any):Observable<any>
  {
    /**
     * {
  "isSuccess": true,
  "message": "string",
  "data": "string",
  "errors": [
    "string"
  ]
}
     */
    return this.http.patch(`${BaseUrl.url}api/Orders/${orderId}/reject?reason=${reason}`,{})
  }


  changeStatus(orderId:any,status:any):Observable<any>
  {
    /**
     * status
     * Pending = 0,  // buyer placed, waiting farmer response
      Confirmed = 1,  // farmer accepted
      Preparing = 2,  // farmer is preparing the order
      ReadyForPickup = 3,  // ready for logistics
      Delivered = 5,  // buyer received
      Cancelled = 6,  // cancelled by buyer or farmer
      Rejected = 7  // farmer rejected
     */
    return this.http.patch(`${BaseUrl.url}api/Orders/${orderId}/change-status?newStatus=${status}`,{})
  }

  getDeliveryMethod(deliveryMethodId:any):Observable<any>
  {
    /**
     * {
        "isSuccess": true,
        "message": "string",
        "data": {
          "id": 0,
          "shortName": "string",
          "description": "string",
          "cost": 0,
          "deliveryTime": "string"
        },
        "errors": [
          "string"
        ]
      }
     */
    return this.http.get(`${BaseUrl.url}api/Orders/delivery-methods/${deliveryMethodId}`)
  }


  cancelOrder(orderId:any):Observable<any>
  {
    return this.http.patch(`${BaseUrl.url}api/Orders/${orderId}/cancel`,{})
  }


  getPaymentByOrder(orderId:any):Observable<any>
  {
    /**
     * response
     * [
  {
    "id": 0,
    "orderId": 0,
    "order": {
      "id": 0,
      "buyerEmail": "string",
      "buyerId": "string",
      "buyer": {
        "id": "string",
        "userName": "string",
        "normalizedUserName": "string",
        "email": "string",
        "normalizedEmail": "string",
        "emailConfirmed": true,
        "passwordHash": "string",
        "securityStamp": "string",
        "concurrencyStamp": "string",
        "phoneNumber": "string",
        "phoneNumberConfirmed": true,
        "twoFactorEnabled": true,
        "lockoutEnd": "2026-06-14T23:22:29.807Z",
        "lockoutEnabled": true,
        "accessFailedCount": 0,
        "name": "string",
        "profileImageUrl": "string",
        "joinDate": "2026-06-14T23:22:29.807Z",
        "isActive": true,
        "isVerified": true,
        "farmerProfile": {
          "farmerId": "string",
          "user": "string",
          "farmName": "string",
          "description": "string",
          "isVerified": true,
          "verifiedAt": "2026-06-14T23:22:29.807Z"
        },
        "traderProfile": {
          "traderId": "string",
          "user": "string",
          "businessName": "string",
          "businessType": 0,
          "description": "string",
          "taxNumber": "string",
          "isVerified": true,
          "verifiedAt": "2026-06-14T23:22:29.807Z"
        },
        "addresses": [
          {
            "id": 0,
            "userId": "string",
            "label": 0,
            "street": "string",
            "city": "string",
            "governorate": "string",
            "postalCode": 0,
            "country": "string",
            "latitude": 0,
            "longitude": 0,
            "isDefault": true
          }
        ],
        "refreshTokens": [
          {
            "userId": "string",
            "token": "string",
            "expiresOn": "2026-06-14T23:22:29.807Z",
            "isExpired": true,
            "createdOn": "2026-06-14T23:22:29.807Z",
            "revokedOn": "2026-06-14T23:22:29.807Z",
            "isActive": true
          }
        ]
      },
      "subTotal": 0,
      "status": 0,
      "notes": "string",
      "dliveryAddress": {
        "name": "string",
        "street": "string",
        "city": "string",
        "governorate": "string",
        "country": "string"
      },
      "paymentStatus": 0,
      "createdAt": "2026-06-14T23:22:29.807Z",
      "updatedAt": "2026-06-14T23:22:29.807Z",
      "farmerId": "string",
      "items": [
        {
          "id": 0,
          "itemOrdered": {
            "productId": 0,
            "productName": "string",
            "pictureUrl": "string",
            "unit": "string"
          },
          "quantity": 0,
          "unitPriceAtOrder": 0,
          "subtotal": 0
        }
      ],
      "payment": "string",
      "paymentIntentId": "string",
      "logistics": {
        "id": 0,
        "orderId": 0,
        "order": "string",
        "pickupAddressId": 0,
        "pickupAddress": {
          "id": 0,
          "userId": "string",
          "label": 0,
          "street": "string",
          "city": "string",
          "governorate": "string",
          "postalCode": 0,
          "country": "string",
          "latitude": 0,
          "longitude": 0,
          "isDefault": true
        },
        "deliveryAddressId": 0,
        "deliveryAddress": {
          "id": 0,
          "userId": "string",
          "label": 0,
          "street": "string",
          "city": "string",
          "governorate": "string",
          "postalCode": 0,
          "country": "string",
          "latitude": 0,
          "longitude": 0,
          "isDefault": true
        },
        "driverName": "string",
        "driverPhone": "string",
        "status": 0,
        "estimatedDelivery": "2026-06-14T23:22:29.807Z",
        "actualDelivery": "2026-06-14T23:22:29.807Z",
        "notes": "string"
      },
      "deliveryMethod": {
        "id": 0,
        "shortName": "string",
        "description": "string",
        "cost": 0,
        "deliveryTime": "string"
      }
    },
    "payerId": "string",
    "payer": {
      "id": "string",
      "userName": "string",
      "normalizedUserName": "string",
      "email": "string",
      "normalizedEmail": "string",
      "emailConfirmed": true,
      "passwordHash": "string",
      "securityStamp": "string",
      "concurrencyStamp": "string",
      "phoneNumber": "string",
      "phoneNumberConfirmed": true,
      "twoFactorEnabled": true,
      "lockoutEnd": "2026-06-14T23:22:29.807Z",
      "lockoutEnabled": true,
      "accessFailedCount": 0,
      "name": "string",
      "profileImageUrl": "string",
      "joinDate": "2026-06-14T23:22:29.807Z",
      "isActive": true,
      "isVerified": true,
      "farmerProfile": {
        "farmerId": "string",
        "user": "string",
        "farmName": "string",
        "description": "string",
        "isVerified": true,
        "verifiedAt": "2026-06-14T23:22:29.807Z"
      },
      "traderProfile": {
        "traderId": "string",
        "user": "string",
        "businessName": "string",
        "businessType": 0,
        "description": "string",
        "taxNumber": "string",
        "isVerified": true,
        "verifiedAt": "2026-06-14T23:22:29.807Z"
      },
      "addresses": [
        {
          "id": 0,
          "userId": "string",
          "label": 0,
          "street": "string",
          "city": "string",
          "governorate": "string",
          "postalCode": 0,
          "country": "string",
          "latitude": 0,
          "longitude": 0,
          "isDefault": true
        }
      ],
      "refreshTokens": [
        {
          "userId": "string",
          "token": "string",
          "expiresOn": "2026-06-14T23:22:29.807Z",
          "isExpired": true,
          "createdOn": "2026-06-14T23:22:29.807Z",
          "revokedOn": "2026-06-14T23:22:29.807Z",
          "isActive": true
        }
      ]
    },
    "amount": 0,
    "method": 0,
    "status": 0,
    "paymentIntentId": "string",
    "paidAt": "2026-06-14T23:22:29.807Z",
    "createdAt": "2026-06-14T23:22:29.807Z"
  }
]
     */
    return this.http.get(`${BaseUrl.url}api/Payments/${orderId}`)
  }


  getCategories():Observable<any>
  {
    /*
    دة مهم عشان اختار ال category لما اجي اضيف منتج
    {
        "isSuccess": true,
        "message": "string",
        "data": [
          {
            "id": 0,
            "name": "string",
            "nameAr": "string",
            "iconUrl": "string",
            "parentCategoryId": 0
          }
        ],
        "errors": [
          "string"
        ]
      }
    */
    return this.http.get(`${BaseUrl.url}api/Categories`);
  }

  getMyProducts(params: any): Observable<ApiResponse<ProductsResponse>> {
    let httpParams: any = {};

    if (params.sort) httpParams.Sort = params.sort;

    if (params.sortDescending != null)
      httpParams.SortDescending = params.sortDescending;

    if (params.categoryId != null)
      httpParams.CategoryId = params.categoryId;

    if (params.hasActiveAuction != null)
      httpParams.HasActiveAuction = params.hasActiveAuction;

    if (params.pageSize != null)
      httpParams.pageSize = params.pageSize;

    if (params.pageIndex != null)
      httpParams.PageIndex = params.pageIndex + 1;

    if (params.search)
      httpParams.Search = params.search;

    if (params.minPrice != null)
      httpParams.MinPrice = params.minPrice;

    if (params.maxPrice != null)
      httpParams.MaxPrice = params.maxPrice;

    if (params.status != null)
      httpParams.Status = params.status;

    console.log(params);

    return this.http.get<ApiResponse<ProductsResponse>>(
      `${BaseUrl.url}api/Products/my-products`,
      { params: httpParams }
    );
  }

  addProduct(formData: FormData): Observable<ApiResponse<any>> {
    /**
     * request body
      Name *
      string
      Description
      string
      CategoryId *
      integer($int32)
      Quantity *
      number($double)
      Unit
      string
      UnitPrice *
      number($double)
      HarvestDate
      string($date-time)
      ExpiryDate
      string($date-time)
      PublishImmediately
      boolean
      Images *
      array<string>
      
      response
      {
          "isSuccess": true,
          "message": "string",
          "data": {
            "name": "string",
            "description": "string",
            "categoryId": 0,
            "quantity": 0,
            "unit": "string",
            "unitPrice": 0,
            "harvestDate": "2026-06-14T23:30:04.931Z",
            "expiryDate": "2026-06-14T23:30:04.932Z",
            "publishImmediately": true,
            "images": [
              "string"
            ]
          },
          "errors": [
            "string"
          ]
        }
     */
    return this.http.post<ApiResponse<any>>(`${BaseUrl.url}api/Products`, formData)
  }

  editProduct(productData: any): Observable<ApiResponse<Product>> {
    /**
     * request body
     * {
        "id": 0,
        "name": "string",
        "description": "string",
        "categoryId": 0,
        "quantity": 0,
        "unit": "string",
        "unitPrice": 0,
        "harvestDate": "2026-06-14T23:34:21.755Z",
        "expiryDate": "2026-06-14T23:34:21.755Z"
      }
      response
      {
        "isSuccess": true,
        "message": "string",
        "data": {
          "id": 0,
          "name": "string",
          "description": "string",
          "quantity": 0,
          "unit": "string",
          "unitPrice": 0,
          "categoryId": 0,
          "categoryName": "string",
          "farmerId": "string",
          "farmerName": "string",
          "farmerGovernorate": "string",
          "farmerCity": "string",
          "mainImageUrl": "string",
          "hasActiveAcution": true
        },
        "errors": [
          "string"
        ]
      }
     */
    return this.http.put<ApiResponse<Product>>(`${BaseUrl.url}api/Products`, productData)
  }

  deleteProduct(productId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${BaseUrl.url}api/Products/${productId}`)
  }


  getProductDetails(id:any):Observable<any>
  {
    /*
      {
  "isSuccess": true,
  "message": "string",
  "data": {
    "id": 0,
    "name": "string",
    "description": "string",
    "quantity": 0,
    "unit": "string",
    "unitPrice": 0,
    "harvestDate": "2026-06-14T23:36:32.328Z",
    "expiryDate": "2026-06-14T23:36:32.328Z",
    "status": 0,
    "createdAt": "2026-06-14T23:36:32.328Z",
    "categoryId": 0,
    "categoryName": "string",
    "farmerId": "string",
    "farmerName": "string",
    "farmerGovernorate": "string",
    "farmerCity": "string",
    "imageUrls": [
      "string"
    ],
    "mainImageUrl": "string",
    "hasActiveAcution": true
  },
  "errors": [
    "string"
  ]
}
    */
    return this.http.get(`${BaseUrl.url}api/Products/${id}`)
  }


  changeProductStatus(form:any):Observable<any>
  {
    /**
     * 
     * product status
     * Draft = 0,        // farmer saved but not published
      Active = 1,       // visible to traders on the website
      Archived = 3,     // farmer hid it
      Deleted = 4,      // deleted by farmer
     * 
     * request body
     * {
        "productId": 0,
        "productStatus": 0
      }
     */
    return this.http.patch(`${BaseUrl.url}api/Products/change-status`,form);
  }

  addProductImages(productId: number, image: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('Image', image);
    return this.http.post<ApiResponse<string>>(`${BaseUrl.url}api/Products/${productId}/images`, formData)
  }

  setMainImage(productId: number, imageId: number): Observable<ApiResponse<string>> {
    return this.http.patch<ApiResponse<string>>(`${BaseUrl.url}api/Products/${productId}/images/${imageId}/set-main`, {})
  }

  deleteImage(productId: number, imageId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${BaseUrl.url}api/Products/${productId}/images/${imageId}`)
  }

  editProfileImage(form:any):Observable<any>
  {
    // request body
    // Image 
    return this.http.put(`${BaseUrl.url}api/Users/profiles/images`,form)
  }
}