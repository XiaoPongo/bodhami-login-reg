import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-status.html',
  styleUrls: ['./login-status.css'],
})
export class LoginStatusComponent {
  @Input() message: string = '';
}