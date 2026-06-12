import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { Auth } from '../services/auth/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const authService = inject(Auth);

  // أضف الـ token في كل request
  const cloned = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      // لو 401 وده مش طلب refresh نفسه (عشان منعملش loop)
      if (error.status === 401 && !req.url.includes('refresh-token')) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            // بعد ما اتجدد الـ token، أعد الـ request بالـ token الجديد
            const newToken = localStorage.getItem('token');
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });
            return next(retried);
          }),
          catchError((refreshError) => {
            // لو الـ refresh فشل → logout
            authService.isLoggedIn.set(false);
            localStorage.removeItem('token');
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
