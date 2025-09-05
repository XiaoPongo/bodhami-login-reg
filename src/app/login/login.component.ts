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
    if (!this.email || !this.password) {
      this.showError = true;
      this.loginMessage = 'Email and password are required.';
      return;
    }

    try {
      const { user } = await this.authService.login(this.email, this.password);

      if (!user) {
        this.showError = true;
        this.loginMessage = 'Login failed. Please try again.';
        return;
      }

      // ✅ Success
      this.showError = false;
      this.loginMessage = 'Login successful! Redirecting...';

      const role = user.user_metadata?.['role'];

      if (role === 'mentor') {
        this.router.navigate(['/mentor/dashboard']);
      } else if (role === 'student') {
        this.router.navigate(['/student/dashboard']);
      } else {
        this.loginMessage = 'No role assigned. Please contact admin.';
      }
    } catch (err: any) {
      this.showError = true;
      this.loginMessage = err.message || 'Unexpected error occurred.';
    }
  }
}
