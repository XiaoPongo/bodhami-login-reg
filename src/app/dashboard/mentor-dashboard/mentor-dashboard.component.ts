import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mentor-dashboard.component.html',
  styleUrls: ['./mentor-dashboard.component.css']
})
export class MentorDashboardComponent {
  constructor(private authService: AuthService, private router: Router) {}

  // ✅ Get user from AuthService
  get user() {
    return this.authService.getCurrentUser();
  }

  // ✅ Placeholder data (replace with real API/service later)
  get classes() {
    return [
      { name: 'Physics 101', students: 32 },
      { name: 'Maths Advanced', students: 28 }
    ];
  }

  get topStudents() {
    return [
      { name: 'Alice', score: 98 },
      { name: 'Bob', score: 94 },
      { name: 'Charlie', score: 91 }
    ];
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
