import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUrl } from '../../../shared/environments/base-url';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TraderProfileService {
  private readonly http = inject(HttpClient);

  getMyOrders():Observable<any>
  {
    /*
      response
      {
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
    return this.http.get(`${BaseUrl.url}api/Orders`);
  }

  getMyOrderDetails(orderId:any):Observable<any>
  {
    /*
    response
    {
      "isSuccess": true,
      "message": "string",
      "data": {
        "id": 0,
        "buyerName": "string",
        "buyerId": "string",
        "buyerEmail": "string",
        "orderDate": "2026-06-15T22:24:39.673Z",
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
          "estimatedDelivery": "2026-06-15T22:24:39.673Z",
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

    return this.http.get(`${BaseUrl.url}api/Orders/${orderId}`)
  }

  cancelOrder(orderId:any):Observable<any>
  {
    return this.http.patch(`${BaseUrl.url}api/Orders/${orderId}/cancel`,{});
  }

  getMyOrderLogistics(orderId:any):Observable<any>
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

    return this.http.get(`${BaseUrl.url}api/Orders/${orderId}/logistics`)
  }
  getMyTraderProfile():Observable<any>
  {
    /**
     * {
        "isSuccess": true,
        "message": "string",
        "data": {
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
          "joinDate": "2026-06-15T22:37:19.562Z",
          "isVerified": true,
          "messsage": "string"
        },
        "errors": [
          "string"
        ]
      }
     */
    return this.http.get(`${BaseUrl.url}api/Traders/trader-profile`)
  }

  updateMyTraderProfile(form:object):Observable<any>
  {
    /**
     * request
     * {
        "userId": "string",
        "businessName": "string",
        "businessType": 0,
        "description": "string",
        "name": "string"
      }
     */
    return this.http.put(`${BaseUrl.url}api/Traders/profiles`,form)
  }

  updateProfileImage(image:any):Observable<any>
  {
    /**
     * request
     * Image *
string($binary)

     */
    return this.http.put(`${BaseUrl.url}api/Users/profiles/images`,image);
  }


  getMyWinningAuctions():Observable<any>
  {
    /**
     * {
        "isSuccess": true,
        "message": "string",
        "data": [
          {
            "id": 0,
            "status": "string",
            "startDate": "2026-06-16T07:34:03.783Z",
            "endDate": "2026-06-16T07:34:03.783Z",
            "startingPrice": 0,
            "currentPrice": 0,
            "highestBid": 0,
            "isEnded": true,
            "minutesRemaining": 0,
            "productId": 0,
            "productName": "string",
            "productUnit": "string",
            "productQuantity": 0,
            "mainImageUrl": "string",
            "farmerId": "string",
            "farmerName": "string",
            "farmerImage": "string"
          }
        ],
        "errors": [
          "string"
        ]
      }
     */
    return this.http.get(`${BaseUrl.url}api/Auctions/my-winning-auctions`);
  }

  getPayments(orderId:any):Observable<any>
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
    "paidAt": "2026-06-16T07:37:05.803Z",
    "createdAt": "2026-06-16T07:37:05.803Z"
  }
]
     */
    return this.http.get(`${BaseUrl.url}api/Payments/${orderId}`)
  }
}
