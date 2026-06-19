import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ICreateReview, IRatingSummary, IReview } from '../../../shared/interfaces/ireview';
import { Observable } from 'rxjs';
import { BaseUrl } from '../../../shared/environments/base-url';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private http = inject(HttpClient);

  createReview(review: ICreateReview): Observable<any> {
    return this.http.post(`${BaseUrl.url}api/Reviews`, review);
  }

  getUserReviews(userId: string): Observable<any> {
    return this.http.get(`${BaseUrl.url}api/Reviews/users/${userId}`);
  }

  getUserRatingSummary(userId: string): Observable<any> {
    return this.http.get(`${BaseUrl.url}api/Reviews/users/${userId}/rating-summary`);
  }
}
