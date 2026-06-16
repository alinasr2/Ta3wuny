import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { Auth } from '../services/auth/auth';

export const isLoginGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  return authService.setLoggedIn().pipe(
    map((res: any) => {
      const isLoggedIn = res.key === true;

      if (!isLoggedIn) {
        router.navigate(['/login']);
        return false;
      }

      return true;
    }),

    catchError(() => {
      router.navigate(['/login']); 
      return of(false);
    })
  );
};