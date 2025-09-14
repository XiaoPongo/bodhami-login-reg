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
  // This is now a live stream of data from your API
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
    this.authService.getSession().then(({ data }) => {
      this.user = data.session?.user;
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/mentor/create']);
  }

  navigateToManageClasses(): void {
    this.router.navigate(['/mentor/manage-classes']);
  }
}