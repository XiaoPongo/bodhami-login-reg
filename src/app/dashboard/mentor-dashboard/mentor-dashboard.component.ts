import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth.service';
import { ClassService, Classroom } from '../../services/class.service'; // Import the service

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink], // Add RouterLink
  templateUrl: './mentor-dashboard.component.html',
  styleUrls: ['./mentor-dashboard.component.css'],
})
export class MentorDashboardComponent implements OnInit, OnDestroy {
  user: any = null;
  classes: Classroom[] = [];
  private classSubscription!: Subscription;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private classService: ClassService // Inject the new service
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    
    // Subscribe to the class data from the service
    this.classSubscription = this.classService.getClasses().subscribe(classes => {
      this.classes = classes;
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.classSubscription) {
      this.classSubscription.unsubscribe();
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/mentor/create']);
  }
}