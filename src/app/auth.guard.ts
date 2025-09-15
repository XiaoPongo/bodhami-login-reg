import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    // We now subscribe to the live session observable from the AuthService.
    return this.authService.getSession$().pipe(
      take(1), // Take the first value emitted and then unsubscribe.
      map(session => {
        if (session) {
          // If a session exists, the user is authenticated.
          return true;
        } else {
          // If no session exists, redirect to the login page.
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}