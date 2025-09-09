// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MentorLayoutComponent } from './dashboard/layout/mentor-layout/mentor-layout.component';
import { MentorDashboardComponent } from './dashboard/mentor-dashboard/mentor-dashboard.component';
import { AuthGuard } from './auth.guard';

// --- ADD THESE IMPORTS ---
// (Assuming these are the correct paths and component names)
import { StudentRegComponent } from './student-reg/student-reg.component';
import { MentorRegComponent } from './mentor-reg/mentor-reg.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // --- ADD THESE TWO LINES ---
  { path: 'student-reg', component: StudentRegComponent },
  { path: 'mentor-reg', component: MentorRegComponent },

  {
    path: 'mentor',
    component: MentorLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: MentorDashboardComponent },
    ],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];