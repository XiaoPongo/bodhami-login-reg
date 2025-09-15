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
  imports: [CommonModule], // Removed unused RouterLink
  templateUrl: './mentor-dashboard.component.html',
  styleUrls: ['./mentor-dashboard.component.css'],
})
export class MentorDashboardComponent implements OnInit {
  user: any = null;
  // This is the live stream of data from your API
  classes$: Observable<Classroom[]>;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private classService: ClassService // Inject the service
  ) {
    // Get the observable stream from the service
    this.classes$ = this.classService.classes$;
  }

  ngOnInit(): void {
    const session = this.authService.getSession();
    this.user = session?.user ?? null;

    // Optional: Log the live data to the console to confirm it's arriving
    this.classes$.subscribe(classes => {
      console.log("Live classes received in dashboard:", classes);
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/mentor/create']);
  }

  // --- THIS METHOD WAS MISSING ---
  navigateToManageClasses(): void {
    this.router.navigate(['/mentor/manage-classes']);
  }
}