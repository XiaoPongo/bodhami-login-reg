// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MentorLayoutComponent } from './dashboard/layout/mentor-layout/mentor-layout.component';
import { MentorDashboardComponent } from './dashboard/mentor-dashboard/mentor-dashboard.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
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
