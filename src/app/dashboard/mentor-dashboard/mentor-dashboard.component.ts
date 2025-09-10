import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mentor-dashboard.component.html',
  styleUrls: ['./mentor-dashboard.component.css'],
})
export class MentorDashboardComponent implements OnInit {
  user: any = null;

  // Updated placeholder data to match the new design
  classes = [
    { name: 'Grade 6 Science - 2025', students: 28, missions: 5 },
    { name: 'History 101', students: 32, missions: 3 },
    { name: 'Introduction to Physics', students: 22, missions: 8 },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // In a real app, you'd fetch this from your service
    this.user = this.authService.getCurrentUser();
  }

  navigateToCreate(): void {
    this.router.navigate(['/mentor/create']);
  }
}