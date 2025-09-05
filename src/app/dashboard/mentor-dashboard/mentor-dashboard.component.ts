// src/app/dashboard/mentor-dashboard/mentor-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [],
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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  navigateToCreate(): void {
    // future: route to create-class
  }
}
