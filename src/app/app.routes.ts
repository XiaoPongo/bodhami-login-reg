import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
// Corrected paths for layout components to point inside the 'dashboard' folder
import { MentorLayoutComponent } from './dashboard/layout/mentor-layout/mentor-layout.component';
import { StudentLayoutComponent } from './dashboard/layout/student-layout/student-layout.component';
import { MentorDashboardComponent } from './dashboard/mentor-dashboard/mentor-dashboard.component';
import { StudentRegComponent } from './student-reg/student-reg.component';
import { MentorRegComponent } from './mentor-reg/mentor-reg.component';
import { AuthGuard } from './auth.guard';
import { StudentDashboardComponent } from './dashboard/student-dashboard/student-dashboard.component';
import { CreateHubComponent } from './dashboard/create-hub/create-hub.component';


export const routes: Routes = [
  // Existing Login & Registration Routes
  { path: 'login', component: LoginComponent },
  { path: 'student-reg', component: StudentRegComponent },
  { path: 'mentor-reg', component: MentorRegComponent },

  // Updated Mentor Route
  {
    path: 'mentor',
    component: MentorLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: MentorDashboardComponent },
      { path: 'create', component: CreateHubComponent },
    ],
  },

  // Existing Student Route
  {
    path: 'student',
    component: StudentLayoutComponent,
    canActivate: [AuthGuard], 
    children: [
      { path: 'dashboard', component: StudentDashboardComponent },
    ],
  },


  // Default route
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  // Optional: A wildcard route for handling 404s
  { path: '**', redirectTo: '/login' }
];
