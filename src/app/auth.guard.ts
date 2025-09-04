import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const AuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isLoggedIn = !!localStorage.getItem('loggedInUser');

  if (!isLoggedIn) {
    alert('You must log in to access the dashboard.');
    router.navigate(['/login']);
    return false;
  }

  return true;
};