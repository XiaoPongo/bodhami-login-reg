import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // <-- IMPORT THE ROUTER

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mentor-dashboard.component.html',
  styleUrls: ['./mentor-dashboard.component.css'],
})
export class MentorDashboardComponent implements OnInit {
  user: any = null;
  classes = [
    { name: 'Math Class' },
    { name: 'Science Class' },
    { name: 'History Class' },
  ];
  topStudents = [
    { name: 'Alice', xp: 1200, progress: 80 },
    { name: 'Bob', xp: 950, progress: 60 },
    { name: 'Charlie', xp: 870, progress: 55 },
  ];

  // INJECT THE ROUTER IN THE CONSTRUCTOR
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  // IMPLEMENT THE NAVIGATION LOGIC
  navigateToCreate(): void {
    this.router.navigate(['/mentor/create']);
  }
}
