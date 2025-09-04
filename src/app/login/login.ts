import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';

import { LoginStatusComponent } from '../login-status/login-status';
import { UserService } from '../user';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
    LoginStatusComponent
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loginMessage = '';
  showError = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Optionally preload users
  }

  onLogin(): void {
    this.loginMessage = '';
    this.showError = false;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

    const isEmailValid = emailPattern.test(this.email);
    const isPasswordValid = passwordPattern.test(this.password);

    if (!isEmailValid || !isPasswordValid) {
      this.showError = true;
      this.loginMessage = 'Invalid email or password format.';
      setTimeout(() => this.showError = false, 5000);
      return;
    }

    const expectedPassword = 'bodhami@123'; //  Shared dummy password
    if (this.password !== expectedPassword) {
      this.showError = true;
      this.loginMessage = 'Incorrect password.';
      setTimeout(() => this.showError = false, 5000);
      return;
    }

    this.userService.getUsers().subscribe(users => {
      const foundUser = users.find(user => user.email === this.email);
      if (foundUser) {
        this.authService.login(foundUser); 
        this.router.navigate(['/dashboard']); 
      } else {
        this.showError = true;
        this.loginMessage = 'User not registered.';
        setTimeout(() => this.showError = false, 5000);
      }
    });
  }
}
