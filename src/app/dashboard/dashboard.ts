import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule 
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  @Input() currentUser: any = null;
  @Input() users: any[] = [];

  constructor(private router: Router) {}

  signOut(): void {
    this.router.navigate(['/login']);
  }
}