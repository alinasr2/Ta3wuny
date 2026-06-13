import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { BaseUrl } from '../../../shared/environments/base-url';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private httpClient = inject(HttpClient);

  isLoggedIn = signal<boolean>(false);

  setLoggedIn() {
    return this.httpClient
      .get(`${BaseUrl.url}api/Auth/is-logined`, {
        withCredentials: true,
      })
      .pipe(
        tap((res: any) => {
          console.log(res);
          
          this.isLoggedIn.set(res.key === true );
        }),
        catchError(() => {
          this.isLoggedIn.set(false);
          return of(null);
        }),
      );
  }

  Login(form: object): Observable<any> {
    return this.httpClient
      .post(`${BaseUrl.url}api/Auth/login`, form, {
        withCredentials: true,
      })
      .pipe(
        tap((res: any) => {
          const token = res?.token ?? res?.accessToken ?? res?.jwt ?? res?.data?.token;

          if (token) {
            localStorage.setItem('token', token);
          }

          this.isLoggedIn.set(true);
        }),
      );
  }

  Logout(): Observable<any> {
    return this.httpClient
      .post(
        `${BaseUrl.url}api/Auth/revoke-token`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap(() => {
          localStorage.removeItem('token');
          this.isLoggedIn.set(false);
        }),
        catchError(() => {
          localStorage.removeItem('token');
          this.isLoggedIn.set(false);
          return of(null);
        }),
      );
  }

  Register(form: object): Observable<any> {
    return this.httpClient.post(`${BaseUrl.url}api/Auth/register`, form);
  }

  refreshToken(): Observable<any> {
    const token = localStorage.getItem('token');

    return this.httpClient
      .get(`${BaseUrl.url}api/Auth/refresh-token`, {
        params: { token: token ?? '' },
        withCredentials: true,
      })
      .pipe(
        tap((res: any) => {
          const newToken = res?.token ?? res?.accessToken;
          if (newToken) {
            localStorage.setItem('token', newToken);
          }
        }),
        catchError((err) => {
          localStorage.removeItem('token');
          this.isLoggedIn.set(false);
          return throwError(() => err);
        }),
      );
  }
}
