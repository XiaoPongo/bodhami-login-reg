import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard';
import { StudentRegComponent } from './student-reg/student-reg.component';
import { MentorRegComponent } from './mentor-reg/mentor-reg.component';
import { AuthGuard } from './auth.guard';

export const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'student-reg', component: StudentRegComponent },
  { path: 'mentor-reg', component: MentorRegComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];