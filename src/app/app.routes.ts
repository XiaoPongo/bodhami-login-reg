import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { StudentRegComponent } from './student-reg/student-reg.component';
import { MentorRegComponent } from './mentor-reg/mentor-reg.component';
import { AuthGuard } from './auth.guard';

import { MentorLayoutComponent } from './dashboard/layout/mentor-layout/mentor-layout.component';
import { StudentLayoutComponent } from './dashboard/layout/student-layout/student-layout.component';
import { MentorDashboardComponent } from './dashboard/mentor-dashboard/mentor-dashboard.component';
import { StudentDashboardComponent } from './dashboard/student-dashboard/student-dashboard.component';
import { CreateHubComponent } from './dashboard/create-hub/create-hub.component';
import { ManageClassesComponent } from './dashboard/manage-classes/manage-classes.component'; 
import { UploadMaterialComponent } from './dashboard/upload-material/upload-material.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'student-reg', component: StudentRegComponent },
  { path: 'mentor-reg', component: MentorRegComponent },

  // Mentor Routes
  {
    path: 'mentor',
    component: MentorLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: MentorDashboardComponent },
      { path: 'create', component: CreateHubComponent },
      // Corrected path to 'manage-classes'
      { path: 'manage-classes', component: ManageClassesComponent }, 
      // Added new route for material uploader
      { path: 'upload-material', component: UploadMaterialComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ],
  },

  // Student Routes
  {
    path: 'student',
    component: StudentLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ],
  },

  // Default & Wildcard
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];