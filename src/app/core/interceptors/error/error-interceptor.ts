import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../../services/auth/auth';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);
  let router = inject(Router);
  let authService = inject(Auth);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      toastr.error(error.error.message, 'خطأ');

      console.log(error);

      // if (error.status === 401 || error.status === 403) {
      //   authService.isLoggedIn.set(false)
      //   router.navigate(['/']);
      // }

      return throwError(() => error);
    })
  );
};