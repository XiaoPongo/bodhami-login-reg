// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loginMessage: string = '';
  showError: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  async onLogin() {
    const { user, error } = await this.authService.login(this.email, this.password);

    if (error) {
      this.showError = true;
      this.loginMessage = error.message;
      setTimeout(() => (this.showError = false), 5000);
    } else if (user) {
      this.router.navigate(['/dashboard']);
    }
  }
}
