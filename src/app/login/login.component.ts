// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showError: boolean = false;
  loginMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onLogin() {
    // Hide previous error on a new attempt
    this.showError = false;

    if (!this.email || !this.password) {
      this.loginMessage = 'Email and password are required.';
      this.triggerErrorPopup();
      return;
    }

    try {
      const { user } = await this.authService.login(this.email, this.password);

      if (!user) {
        this.loginMessage = 'Login failed. Please try again.';
        this.triggerErrorPopup();
        return;
      }

      // ✅ Success
      this.loginMessage = 'Login successful! Redirecting...';
      const role = user.user_metadata?.['role'];

      if (role === 'mentor') {
        this.router.navigate(['/mentor/dashboard']);
      } else if (role === 'student') {
        this.router.navigate(['/student/dashboard']);
      } else {
        this.loginMessage = 'No role assigned. Please contact admin.';
        this.triggerErrorPopup();
      }
    } catch (err: any) {
      // ✅ FIXED: Better error handling
      if (err.message && err.message.includes('Invalid login credentials')) {
        this.loginMessage = 'Invalid email or password. New user? Please register.';
      } else {
        this.loginMessage = err.message || 'An unexpected error occurred.';
      }
      this.triggerErrorPopup();
    }
  }

  /**
   * ✅ FIXED: Triggers the floating error popup animation reliably.
   * This function resets the showError flag and then sets it back to true
   * inside a timeout, forcing Angular's change detection to re-run the animation.
   */
  private triggerErrorPopup(): void {
    // Reset the flag to ensure the animation can be re-triggered.
    this.showError = false;
    // Use a timeout to apply the change after the current browser tick.
    setTimeout(() => {
      this.showError = true;
    }, 10);
  }
}
