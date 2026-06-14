import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUrl } from '../../../shared/environments/base-url';

@Injectable({
  providedIn: 'root',
})
export class Users {
  private readonly http = inject(HttpClient);

  getAllFarmers(): Observable<any> {
    return this.http.get(`${BaseUrl.url}api/Farmers/verified-farmers`);
  }

  getFarmer(id: any): Observable<any> {
    //     {
    //   "isSuccess": true,
    //   "message": "string",
    //   "data": {
    //     "farmerId": "string",
    //     "name": "string",
    //     "farmName": "string",
    //     "description": "string",
    //     "email": "string",
    //     "userName": "string",
    //     "address": {
    //       "id": 0,
    //       "userId": "string",
    //       "street": "string",
    //       "city": "string",
    //       "governorate": "string",
    //       "postalCode": 0,
    //       "country": "string",
    //       "latitude": 0,
    //       "longitude": 0
    //     },
    //     "profileImageUrl": "string",
    //     "joinDate": "2026-06-12T23:38:51.659Z",
    //     "isVerified": true,
    //     "messsage": "string"
    //   },
    //   "errors": [
    //     "string"
    //   ]
    // }

    return this.http.get(`${BaseUrl.url}api/Farmers/farmer-profile?id=${id}`);
  }
  getFarmerProducts(id: any): Observable<any> {
    // {
    //   "isSuccess": true,
    //   "message": "string",
    //   "data": [
    //     {
    //       "id": 0,
    //       "name": "string",
    //       "description": "string",
    //       "quantity": 0,
    //       "unit": "string",
    //       "unitPrice": 0,
    //       "categoryId": 0,
    //       "categoryName": "string",
    //       "farmerId": "string",
    //       "farmerName": "string",
    //       "farmerGovernorate": "string",
    //       "farmerCity": "string",
    //       "mainImageUrl": "string",
    //       "hasActiveAcution": true
    //     }
    //   ],
    //   "errors": [
    //     "string"
    //   ]
    // }

    return this.http.get(`${BaseUrl.url}api/Products/farmers/${id}`);
  }

  getUserReview(userId: any): Observable<any> {
    // {
    //   "isSuccess": true,
    //   "message": "string",
    //   "data": [
    //     {
    //       "id": 0,
    //       "reviewerName": "string",
    //       "reviewerImageUrl": "string",
    //       "rating": 0,
    //       "comment": "string",
    //       "isApproved": true,
    //       "createdAt": "2026-06-12T23:39:53.923Z"
    //     }
    //   ],
    //   "errors": [
    //     "string"
    //   ]
    // }

    return this.http.get(`${BaseUrl.url}api/Reviews/users/${userId}`);
  }

  getUserRating(userId: any): Observable<any> {
    //     {
    //   "isSuccess": true,
    //   "message": "string",
    //   "data": {
    //     "userId": "string",
    //     "averageRating": 0,
    //     "totalReviews": 0,
    //     "fiveStars": 0,
    //     "fourStars": 0,
    //     "threeStars": 0,
    //     "twoStars": 0,
    //     "oneStar": 0
    //   },
    //   "errors": [
    //     "string"
    //   ]
    // }

    return this.http.get(`${BaseUrl.url}/api/Reviews/users/${userId}/rating-summary`);
  }

  getAllTraders(): Observable<any> {
    return this.http.get(`${BaseUrl.url}api/Traders/verified-traders`);
  }

  getTraderProfile(id: string): Observable<any> {
    return this.http.get(`${BaseUrl.url}api/Traders/trader-profiles/${id}`);
  }

  getTraderAddress(userId: string): Observable<any> {
    return this.http.get(`${BaseUrl.url}api/Users/${userId}/addresses`);
  }
}
