import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
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
          this.isLoggedIn.set(res?.isAuthenticated ?? true);
        })
      );
  }

  Login(form: object): Observable<any> {
    return this.httpClient
      .post(`${BaseUrl.url}api/Auth/login`, form, {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          this.isLoggedIn.set(true);
        })
      );
  }

  Logout(): Observable<any> {
    return this.httpClient.post(`${BaseUrl.url}api/Auth/revoke-token`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.isLoggedIn.set(false);
      })
    );
  }

  Register(form: object): Observable<any> {
    return this.httpClient.post(`${BaseUrl.url}api/Auth/register`, form);
  }
}