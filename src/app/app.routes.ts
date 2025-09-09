import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MentorLayoutComponent } from './dashboard/layout/mentor-layout/mentor-layout.component';
import { MentorDashboardComponent } from './dashboard/mentor-dashboard/mentor-dashboard.component';
import { StudentRegComponent } from './student-reg/student-reg.component';
import { MentorRegComponent } from './mentor-reg/mentor-reg.component';
import { AuthGuard } from './auth.guard';

// --- ADD THESE IMPORTS ---
import { StudentLayoutComponent } from './dashboard/layout/student-layout/student-layout.component';
import { StudentDashboardComponent } from './dashboard/student-dashboard/student-dashboard.component';


export const routes: Routes = [
  // Existing Login & Registration Routes
  { path: 'login', component: LoginComponent },
  { path: 'student-reg', component: StudentRegComponent },
  { path: 'mentor-reg', component: MentorRegComponent },

  // Existing Mentor Route
  {
    path: 'mentor',
    component: MentorLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: MentorDashboardComponent },
      // ... other mentor routes can go here
    ],
  },

  // --- ADD THIS NEW STUDENT ROUTE ---
  {
    path: 'student',
    component: StudentLayoutComponent,
    canActivate: [AuthGuard], // Protect the student dashboard as well
    children: [
      { path: 'dashboard', component: StudentDashboardComponent },
      // ... other student routes can go here
    ],
  },


  // Default route
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  // Optional: A wildcard route for handling 404s
  { path: '**', redirectTo: '/login' }
];