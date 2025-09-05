import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { StudentRegComponent } from './student-reg/student-reg.component';
import { MentorRegComponent } from './mentor-reg/mentor-reg.component';
import { DashboardComponent } from './dashboard/mentor-dashboard/mentor-dashboard.component';
import { AuthGuard } from './auth.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'student-reg', component: StudentRegComponent },
  { path: 'mentor-reg', component: MentorRegComponent },
  { path: 'mentor-dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];
