import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ClassService } from '../../services/class.service'; // Import ClassService
import { Classroom } from '../../services/api.service'; // Import Classroom interface

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mentor-dashboard.component.html',
  styleUrls: ['./mentor-dashboard.component.css'],
})
export class MentorDashboardComponent implements OnInit {
  // This property is now an Observable stream of classrooms
  classes$: Observable<Classroom[]>;
  user: any = null; // Assuming user info is still needed

  constructor(private router: Router, private classService: ClassService) {
    // Get the live stream of classes from the service
    this.classes$ = this.classService.classes$;
  }

  ngOnInit(): void {
    // You might get user info from your AuthService here if needed
  }

  navigateToCreate(): void {
    this.router.navigate(['/mentor/create']);
  }
  
  navigateToManageClasses(): void {
    this.router.navigate(['/mentor/manage-classes']);
  }
}