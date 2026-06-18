import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUrl } from '../../../shared/environments/base-url';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AdminProfileService {
  private readonly httpClient = inject(HttpClient);

  getDashboardReports():Observable<any>
  {
    /**
     * {
      "isSuccess": true,
      "message": "string",
      "data": {
        "totalUsers": 0,
        "totalFarmers": 0,
        "totalTraders": 0,
        "pendingVerifications": 0,
        "bannedUsers": 0,
        "totalProducts": 0,
        "activeProducts": 0,
        "soldOutProducts": 0,
        "underReviewProducts": 0,
        "totalOrders": 0,
        "pendingOrders": 0,
        "deliveredOrders": 0,
        "cancelledOrders": 0,
        "totalAuctions": 0,
        "activeAuctions": 0,
        "endedAuctions": 0,
        "totalPosts": 0,
        "pendingReviews": 0,
        "newUsersThisMonth": 0,
        "newOrdersThisMonth": 0,
        "newProductsThisMonth": 0
      },
      "errors": [
        "string"
      ]
    }
     */
    return this.httpClient.get(`${BaseUrl.url}api/Admins/dashboard-report`)
  }

  getUsers(params: any): Observable<any> {
    /**
Admin only endpoint to retrieve a paginated list of all users on the platform, with optional filtering and sorting. IsActive is the user banned or not IsVerified is the user profile verified by admin or still pending
     * {
  "isSuccess": true,
  "message": "string",
  "data": {
    "pageIndex": 0,
    "pageSize": 0,
    "count": 0,
    "data": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "phoneNumber": "string",
        "role": "string",
        "isActive": true,
        "isVerified": true,
        "joinDate": "2026-06-17T13:51:43.378Z",
        "profileImageUrl": "string",
        "totalOrders": 0,
        "totalProducts": 0
      }
    ],
    "totalPages": 0,
    "hasNextPage": true,
    "hasPreviousPage": true
  },
  "errors": [
    "string"
  ]
}
     */

    let httpParams: any = {};

    if (params.searchTerm) httpParams.SearchTerm = params.searchTerm;

    if (params.role) httpParams.Role = params.role;

    if (params.isActive != null) httpParams.IsActive = params.isActive;

    if (params.isVerified != null) httpParams.IsVerified = params.isVerified;

    if (params.joinedFrom) httpParams.JoinedFrom = params.joinedFrom;

    if (params.joinedTo) httpParams.JoinedTo = params.joinedTo;

    if (params.sortBy) httpParams.SortBy = params.sortBy;

    if (params.sortDescending != null) httpParams.SortDescending = params.sortDescending;

    if (params.pageNumber != null) httpParams.PageNumber = params.pageNumber;

    if (params.pageSize != null) httpParams.PageSize = params.pageSize;

    console.log(params);

    return this.httpClient.get(`${BaseUrl.url}api/Admins/users`, { params: httpParams });
  }

  // deleteUser(id:any):Observable<any>
  // {
  //   return this.httpClient.delete(`${BaseUrl.url}api/Admins/users/${id}`)
  // }

  verifyFarmer(id:any):Observable<any>
  {
    return this.httpClient.patch(`${BaseUrl.url}api/Admins/verify-farmer/${id}`,{})
  }

  verifyTrader(id:any):Observable<any>
  {
    return this.httpClient.patch(`${BaseUrl.url}api/Admins/verify-trader/${id}`,{})
  }

  toggleUserStatus(id:any):Observable<any>
  {
    return this.httpClient.patch(`${BaseUrl.url}api/Admins/toggle-user-status/${id}`,{})
  }

  getPendingFarmers():Observable<any>
  {
    /**
     * {
  "isSuccess": true,
  "message": "string",
  "data": [
    {
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
      "joinDate": "2026-06-17T14:05:35.458Z",
      "isVerified": true,
      "messsage": "string"
    }
  ],
  "errors": [
    "string"
  ]
}
     */
    return this.httpClient.get(`${BaseUrl.url}api/Admins/pending-farmers`)
  }

  getPendingTraders():Observable<any>
  {

    /**
     * {
  "isSuccess": true,
  "message": "string",
  "data": [
    {
      "traderId": "string",
      "name": "string",
      "businessName": "string",
      "businessType": "string",
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
      "taxNumber": 0,
      "joinDate": "2026-06-17T14:06:57.373Z",
      "isVerified": true,
      "messsage": "string"
    }
  ],
  "errors": [
    "string"
  ]
}
     */
    return this.httpClient.get(`${BaseUrl.url}api/Admins/pending-traders`)
  }

  getBannedUsers():Observable<any>
  {
    /**
     * {
  "isSuccess": true,
  "message": "string",
  "data": [
    {
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
      "joinDate": "2026-06-17T14:07:45.705Z",
      "isVerified": true,
      "messsage": "string"
    }
  ],
  "errors": [
    "string"
  ]
}
     */
    return this.httpClient.get(`${BaseUrl.url}api/Admins/banned-users`)
  }

  getVerifiedUsers():Observable<any>
  {

    /**
     * {
  "isSuccess": true,
  "message": "string",
  "data": [
    {
      "id": "string",
      "userName": "string",
      "name": "string",
      "email": "string",
      "isEmailConfirmed": true
    }
  ],
  "errors": [
    "string"
  ]
}
     */

    return this.httpClient.get(`${BaseUrl.url}api/Admins/verified-users`)
  }

  getNonVerifiedUsers():Observable<any>
  {
    return this.httpClient.get(`${BaseUrl.url}api/Admins/non-verified-users`)
  }

  getProducts(params: any): Observable<any> {

    /**
     * {
  "isSuccess": true,
  "message": "string",
  "data": {
    "pageIndex": 0,
    "pageSize": 0,
    "count": 0,
    "data": [
      {
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
      }
    ],
    "totalPages": 0,
    "hasNextPage": true,
    "hasPreviousPage": true
  },
  "errors": [
    "string"
  ]
}
     */

    let httpParams: any = {};

    if (params.sort) httpParams.Sort = params.sort;

    if (params.sortDescending != null) httpParams.SortDescending = params.sortDescending;

    if (params.categoryId != null) httpParams.CategoryId = params.categoryId;

    if (params.farmerId) httpParams.FarmerId = params.farmerId;

    if (params.hasActiveAuction != null) httpParams.HasActiveAuction = params.hasActiveAuction;

    if (params.pageSize != null) httpParams.pageSize = params.pageSize;

    if (params.pageIndex != null) httpParams.PageIndex = params.pageIndex + 1;

    if (params.search) httpParams.Search = params.search;

    if (params.minPrice != null) httpParams.MinPrice = params.minPrice;

    if (params.maxPrice != null) httpParams.MaxPrice = params.maxPrice;

    if (params.status != null) httpParams.Status = params.status;


    return this.httpClient.get(`${BaseUrl.url}api/Products`, { params: httpParams });
  }

  reviewProduct(productId:any):Observable<any>
  {
    /**
      Admin only endpoint to flag a product for review. This action will change the product's status to "UnderReview" or return it to active status if it is already under review. This allows admins to manage product listings and ensure they meet platform standards.
     */
    return this.httpClient.put(`${BaseUrl.url}api/Admins/products/${productId}/review`,{})
  }

  deleteProduct(id:any):Observable<any>
  {
    return this.httpClient.delete(`${BaseUrl.url}api/Products/${id}`);
  }

  changeStatusProduct(form:object):Observable<any>
  {
    /**
     * request body 
     * {
        "productId": 0,
        "productStatus": 0
      }

      ****product status***
       Draft = 0,   // farmer saved but not published
    Active = 1,   // visible to traders on the website
    SoldOut = 2,   // quantity = 0
    Archived = 3,   //  farmer hid it 
    Deleted = 4, //deleted by farmer 
    UnderReview = 5   // admin flagged it
     */
    return this.httpClient.patch(`${BaseUrl.url}api/Products/change-status`,form)
  }

  getAllAuctions(params?: {
    productId?: number;
    farmerId?: string;
    winnerId?: string;
    status?: 0 | 1 | 2 | 3 | 4;
    sort?: string;
    sortDescending?: boolean;
    pageSize?: number;
    pageIndex?: number;
  }): Observable<any> {

    /**
     * {
  "isSuccess": true,
  "message": "string",
  "data": {
    "pageIndex": 0,
    "pageSize": 0,
    "count": 0,
    "data": [
      {
        "id": 0,
        "status": "string",
        "startDate": "2026-06-17T14:24:44.006Z",
        "endDate": "2026-06-17T14:24:44.006Z",
        "startingPrice": 0,
        "currentPrice": 0,
        "totalBids": 0,
        "isEnded": true,
        "minutesRemaining": 0,
        "productId": 0,
        "productName": "string",
        "productUnit": "string",
        "productQuantity": 0,
        "mainImageUrl": "string",
        "farmerId": "string",
        "farmerName": "string",
        "farmerImage": "string",
        "winnerId": "string",
        "winnerName": "string",
        "winnerImage": "string"
      }
    ],
    "totalPages": 0,
    "hasNextPage": true,
    "hasPreviousPage": true
  },
  "errors": [
    "string"
  ]
}
     */

    let httpParams:any = {};
    
    if (params) {
      if (params.productId !== undefined) {
        httpParams.ProductId = params.productId.toString();
      }
      if (params.farmerId) {
        httpParams.FarmerId = params.farmerId;
      }
      if (params.winnerId) {
        httpParams.WinnerId = params.winnerId;
      }
      if (params.status !== undefined) {
        httpParams.Status = params.status.toString();
      }
      if (params.sort) {
        httpParams.Sort = params.sort;
      }
      if (params.sortDescending !== undefined) {
        httpParams.SortDescending = params.sortDescending.toString();
      }
      if (params.pageSize !== undefined) {
        httpParams.pageSize = params.pageSize.toString();
      }
      if (params.pageIndex !== undefined) {
        httpParams.PageIndex = params.pageIndex + 1;
      }
    }
    
    return this.httpClient.get(`${BaseUrl.url}api/Auctions`, { params: httpParams });
  }

  deleteAuction(auctionId:any):Observable<any>
  {
    return this.httpClient.delete(`${BaseUrl.url}/api/Auctions/${auctionId}`);
  }

  addRole(form:object):Observable<any>
  {
    console.log(form);
    
    /**
     * request body
     * {
        "userId": "string",
        "role": "string" // Farmer , Trader , Admin
      }
     */

    return this.httpClient.post(`${BaseUrl.url}api/Auth/add-role`,form);
  }

  getCategories():Observable<any>
  {
    /*
    {
      "isSuccess": true,
      "message": "string",
      "data": [
        {
          "id": 0,
          "name": "string",
          "nameAr": "string", دة اللي يتعرض
          "iconUrl": "string",
          "parentCategoryId": 0
        }
      ],
      "errors": [
        "string"
      ]
    }
    */

    return this.httpClient.get(`${BaseUrl.url}api/Categories`);
  }

  createCategory(form:object):Observable<any>
  {
    /**
     * {
        "name": "string", for engilsh
        "nameAr": "string", for arabic
      }
     */
    return this.httpClient.post(`${BaseUrl.url}api/Categories`,form)
  }

  updateCategory(form:object,categoryId:any):Observable<any>
  {
    /**
     * {
        "name": "string", for engilsh
        "nameAr": "string", for arabic
      }
     */
    return this.httpClient.put(`${BaseUrl.url}api/Categories/${categoryId}`,form)
  }

  // deleteCategory(categoryId:any):Observable<any>
  // {
  //   return this.httpClient.delete(`${BaseUrl.url}api/Categories/${categoryId}`);
  // }


  getDeliveryMethods():Observable<any>
  {
    /**
     * {
        "isSuccess": true,
        "message": "string",
        "data": [
          {
            "id": 0,
            "shortName": "string",
            "description": "string",
            "cost": 0,
            "deliveryTime": "string"
          }
        ],
        "errors": [
          "string"
        ]
      }
     */

    return this.httpClient.get(`${BaseUrl.url}api/DeliveryMethods`);
  }

  createDeliveryMethods(form:object):Observable<any>
  {
    /**
     * {
        "shortName": "string",
        "description": "string",
        "cost": 0,
        "deliveryTime": "string"
      }
     */

    return this.httpClient.post(`${BaseUrl.url}api/DeliveryMethods`,form)
  }
  
  updateDeliveryMethods(deliveryMethodId:any , form:object):Observable<any>
  {
    /**
     * request body
     * {
        "shortName": "string",
        "description": "string",
        "cost": 0,
        "deliveryTime": "string"
      }
     */
    return this.httpClient.put(`${BaseUrl.url}api/DeliveryMethods/${deliveryMethodId}`,form)
  }

  deleteDeliveryMethods(deliveryMethodId:any):Observable<any>
  {
    return this.httpClient.delete(`${BaseUrl.url}api/DeliveryMethods/${deliveryMethodId}`)
  }

  getAdminOrders(params: any): Observable<any> {

    /**
     * {
  "isSuccess": true,
  "message": "string",
  "data": {
    "pageIndex": 0,
    "pageSize": 0,
    "count": 0,
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
    "totalPages": 0,
    "hasNextPage": true,
    "hasPreviousPage": true
  },
  "errors": [
    "string"
  ]
}
     */

    let httpParams: any = {};

    if (params.sortDescending != null)
      httpParams.SortDescending = params.sortDescending;

    if (params.pageSize != null)
      httpParams.pageSize = params.pageSize;

    if (params.pageIndex != null)
      httpParams.PageIndex = params.pageIndex + 1;

    if (params.productId != null)
      httpParams.ProductId = params.productId;

    if (params.minPrice != null)
      httpParams.MinPrice = params.minPrice;

    if (params.maxPrice != null)
      httpParams.MaxPrice = params.maxPrice;

    if (params.orderStatus != null)
      httpParams.OrderStatus = params.orderStatus;

    if (params.paymentStatus != null)
      httpParams.PaymentStatus = params.paymentStatus;

    console.log(params);

    return this.httpClient.get(
      `${BaseUrl.url}api/Orders/admin`,
      { params: httpParams }
    );
  }

  getAdminOrderDetails(orderId:any):Observable<any>
  {
    /**
     * {
  "isSuccess": true,
  "message": "string",
  "data": {
    "id": 0,
    "buyerName": "string",
    "buyerId": "string",
    "buyerEmail": "string",
    "orderDate": "2026-06-17T14:49:29.274Z",
    "total": 0,
    "status": "string",
    "notes": "string",
    "deliveryMethod": {
      "id": 0,
      "shortName": "string",
      "description": "string",
      "cost": 0,
      "deliveryTime": "string"
    },
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
    "logistics": {
      "logisticsId": 0,
      "logisticsStatus": "string",
      "estimatedDelivery": "2026-06-17T14:49:29.275Z",
      "notes": "string"
    },
    "payment": {
      "id": 0,
      "paymentStatus": "string",
      "paymentMethod": "string",
      "paymentIntentId": "string"
    }
  },
  "errors": [
    "string"
  ]
}
     */

    return this.httpClient.get(`${BaseUrl.url}api/Orders/${orderId}`);
  }

  changeOrderStatus(orderId:any,status:any):Observable<any>
  {
    /**
     * Pending = 0,  // buyer placed, waiting farmer response
    Confirmed = 1,  // farmer accepted
    Preparing = 2,  // farmer is preparing the order
    ReadyForPickup = 3, // ready for logistics
    InDelivery = 4,  // driver picked up
    Delivered = 5,  // buyer received
    Cancelled = 6,  // cancelled by buyer or farmer
    Rejected = 7   // farmer rejected
     * 
     */
    return this.httpClient.patch(`${BaseUrl.url}api/Orders/${orderId}/change-status?newStatus=${status}`,{})
  }

  cancelOrder(orderId:any):Observable<any>
  {
    return this.httpClient.patch(`${BaseUrl.url}api/Orders/${orderId}/cancel`,{});
  }

  getPaymentByOrder(orderId:any):Observable<any>
  {
    /**
     * [
  {
    "id": 0,
    "orderId": 0,
    "payerId": "string",
    "payerName": "string",
    "amount": 0,
    "method": 0,
    "status": 0,
    "paymentIntentId": "string",
    "paidAt": "2026-06-17T15:07:12.946Z",
    "createdAt": "2026-06-17T15:07:12.946Z"
  }
]
     */
    return this.httpClient.get(`${BaseUrl.url}api/Payments/${orderId}`)
  }

  getOrderLogistics(orderId:any):Observable<any>
  {
    /*
    {
      "isSuccess": true,
      "message": "string",
      "data": {
        "id": 0,
        "orderId": 0,
        "pickupAddressId": 0,
        "pickupAddress": {
          "name": "string",
          "street": "string",
          "city": "string",
          "governorate": "string",
          "country": "string"
        },
        "deliveryAddressId": 0,
        "deliveryAddress": {
          "name": "string",
          "street": "string",
          "city": "string",
          "governorate": "string",
          "country": "string"
        },
        "driverName": "string",
        "driverPhone": "string",
        "status": 0,
        "estimatedDelivery": "2026-06-15T22:29:06.209Z",
        "actualDelivery": "2026-06-15T22:29:06.209Z",
        "notes": "string"
      },
      "errors": [
        "string"
      ]
    }
    */

    return this.httpClient.get(`${BaseUrl.url}api/Orders/${orderId}/logistics`)
  }

  changeStatusLogistics(orderId:any,status:any):Observable<any>
  {
    /**
     * NotScheduled = 0,
    Scheduled = 1,
    PickedUp = 2,
    InTransit = 3,
    Delivered = 4,
    Failed = 5   //farmer reject the order (ممكن بدل من اغير حالة اللوجستكس لفشل ممكن احذف الريكود من الداتا بيز او اسيبه لو هحتاج الداتا دي) or there is a problem occured during delivery
     */
    return this.httpClient.patch(`${BaseUrl.url}api/Orders/${orderId}/logistics/change-status?status=${status}`,{})
  }


  getAllPayments():Observable<any>
  {
    /**
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
        "lockoutEnd": "2026-06-17T15:07:34.427Z",
        "lockoutEnabled": true,
        "accessFailedCount": 0,
        "name": "string",
        "profileImageUrl": "string",
        "joinDate": "2026-06-17T15:07:34.427Z",
        "isActive": true,
        "isVerified": true,
        "farmerProfile": {
          "farmerId": "string",
          "user": "string",
          "farmName": "string",
          "description": "string",
          "isVerified": true,
          "verifiedAt": "2026-06-17T15:07:34.427Z"
        },
        "traderProfile": {
          "traderId": "string",
          "user": "string",
          "businessName": "string",
          "businessType": 0,
          "description": "string",
          "taxNumber": "string",
          "isVerified": true,
          "verifiedAt": "2026-06-17T15:07:34.427Z"
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
            "expiresOn": "2026-06-17T15:07:34.427Z",
            "isExpired": true,
            "createdOn": "2026-06-17T15:07:34.427Z",
            "revokedOn": "2026-06-17T15:07:34.427Z",
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
      "createdAt": "2026-06-17T15:07:34.427Z",
      "updatedAt": "2026-06-17T15:07:34.427Z",
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
        "estimatedDelivery": "2026-06-17T15:07:34.427Z",
        "actualDelivery": "2026-06-17T15:07:34.427Z",
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
      "lockoutEnd": "2026-06-17T15:07:34.427Z",
      "lockoutEnabled": true,
      "accessFailedCount": 0,
      "name": "string",
      "profileImageUrl": "string",
      "joinDate": "2026-06-17T15:07:34.427Z",
      "isActive": true,
      "isVerified": true,
      "farmerProfile": {
        "farmerId": "string",
        "user": "string",
        "farmName": "string",
        "description": "string",
        "isVerified": true,
        "verifiedAt": "2026-06-17T15:07:34.427Z"
      },
      "traderProfile": {
        "traderId": "string",
        "user": "string",
        "businessName": "string",
        "businessType": 0,
        "description": "string",
        "taxNumber": "string",
        "isVerified": true,
        "verifiedAt": "2026-06-17T15:07:34.427Z"
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
          "expiresOn": "2026-06-17T15:07:34.427Z",
          "isExpired": true,
          "createdOn": "2026-06-17T15:07:34.427Z",
          "revokedOn": "2026-06-17T15:07:34.427Z",
          "isActive": true
        }
      ]
    },
    "amount": 0,
    "method": 0,
    "status": 0,
    "paymentIntentId": "string",
    "paidAt": "2026-06-17T15:07:34.427Z",
    "createdAt": "2026-06-17T15:07:34.427Z"
  }
]
     */
    return this.httpClient.get(`${BaseUrl.url}api/Payments`)
  }

  changeStatusPayment(orderId:any , status:any):Observable<any>
  {
    /**
     * Unpaid = 0,
    Paid = 1,
    Refunded = 2,
    Failed = 3   // حصل مشكلة قبل الدفع او تم رفض الاوردر او الغائه
     */
    return this.httpClient.patch(`${BaseUrl.url}api/Payments/${orderId}/change-status?status=${status}`,{})
  }

  getMyProfile():Observable<any>
  {
    /**
     * {
  "isSuccess": true,
  "message": "string",
  "data": {
    "id": "string",
    "name": "string",
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
    "joinDate": "2026-06-17T21:58:59.902Z",
    "isVerified": true,
    "messsage": "string"
  },
  "errors": [
    "string"
  ]
}
     */

    return this.httpClient.get(`${BaseUrl.url}api/Admins/my-profile`)
  }

  updateMyProfile(form:object):Observable<any>
  {
    /**
     * request body
     * {
  "name": "string",
  "email": "string",
  "userName": "string"
}
     */
    return this.httpClient.put(`${BaseUrl.url}api/Admins`,form)
  }

  getPendingReview():Observable<any>
  {
    /**
     * {
  "isSuccess": true,
  "message": "string",
  "data": [
    {
      "id": 0,
      "reviewerName": "string",
      "reviewerImageUrl": "string",
      "targetName": "string",
      "targetImageUrl": "string",
      "rating": 0,
      "comment": "string",
      "isApproved": true,
      "createdAt": "2026-06-17T22:01:45.811Z"
    }
  ],
  "errors": [
    "string"
  ]
}
     */
    return this.httpClient.get(`${BaseUrl.url}api/Reviews/pending`)
  }

  deleteReview(reviewId:any):Observable<any>
  {
    return this.httpClient.delete(`${BaseUrl.url}api/Reviews/${reviewId}`);
  }

  approveReview(reviewId:any):Observable<any>
  {
    return this.httpClient.post(`${BaseUrl.url}api/Reviews/${reviewId}/approve`,{})
  }
  
  updateUserImage(image:any):Observable<any>
  {
    /**
     * request body
     * Image *
      string($binary)

     */
    return this.httpClient.put(`${BaseUrl.url}api/Users/profiles/images`,image)
  }
}
