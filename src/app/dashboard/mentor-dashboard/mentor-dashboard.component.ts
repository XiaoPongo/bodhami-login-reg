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

  constructor(
    private authService: AuthService, 
    private router: Router,
    private classService: ClassService
  ) {
    this.classes$ = this.classService.classes$;
  }

  ngOnInit(): void {
    // THIS IS THE FIX:
    // Get the session directly. It's not a Promise.
    const session = this.authService.getSession();
    // The user object is on the session, or it might be null.
    this.user = session?.user ?? null;
  }

  navigateToCreate(): void {
    this.router.navigate(['/mentor/create']);
  }

  navigateToManageClasses(): void {
    this.router.navigate(['/mentor/manage-classes']);
  }
}