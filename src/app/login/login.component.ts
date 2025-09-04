import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] // ⚡ create this file if missing
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showError: boolean = false;
  loginMessage: string = '';

  async onLogin() {
    if (!this.email || !this.password) {
      this.showError = true;
      this.loginMessage = 'Email and password are required.';
      return;
    }

    // 👉 Later connect with your AuthService
    console.log('Logging in with:', this.email, this.password);
    this.showError = false;
    this.loginMessage = '';
  }
}
