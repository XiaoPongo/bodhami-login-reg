import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ClassService } from '../../services/class.service';
import { Classroom } from '../../services/api.service';

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mentor-dashboard.component.html',
  styleUrls: ['./mentor-dashboard.component.css'],
})
export class MentorDashboardComponent implements OnInit {
  user: any = null;
  classes$: Observable<Classroom[]>;

  // Properties for the "Coming Soon" notification
  showNotification = false;
  notificationMessage = '';
  private notificationTimeout: any;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private classService: ClassService
  ) {
    this.classes$ = this.classService.classes$;
  }

  ngOnInit(): void {
    const session = this.authService.getSession();
    this.user = session?.user ?? null;
  }

  navigateToCreate(): void {
    this.router.navigate(['/mentor/create']);
  }

  navigateToManageClasses(): void {
    this.router.navigate(['/mentor/manage-classes']);
  }

  // --- NEW METHOD ---
  // Navigates to the manage classes page with a query parameter for the specific class
  navigateToEditClass(classId: number | undefined): void {
    if (!classId) return;
    this.router.navigate(['/mentor/manage-classes'], { queryParams: { classId: classId } });
  }

  // --- NEW METHOD ---
  // Shows the blue "Coming Soon" popup message
  showComingSoonNotification(): void {
    // Clear any existing timeout to prevent flickering
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    this.notificationMessage = 'Feature coming soon!';
    this.showNotification = true;

    // Hide the notification after 3 seconds
    this.notificationTimeout = setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }
}