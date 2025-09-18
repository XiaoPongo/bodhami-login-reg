import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { StudentProgress, StudentProgressService, StreakStage } from '../../services/student-progress.service';

// --- Interfaces ---
interface Achievement {
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
}
interface Note {
  title: string;
  date: string;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
})
export class StudentDashboardComponent implements OnInit {
  isLoading$: Observable<boolean>;
  welcomeName: string = 'Student';

  // ✅ Fixed: raw image link
  dashboardImageUrl =
    'https://raw.githubusercontent.com/XiaoPongo/bodhami-login-reg/main/student-dashboard.png?raw=true';

  progress$: Observable<StudentProgress | null>;
  streakStage$: Observable<StreakStage>;

  // Modal visibility
  showAchievements = false;
  showStreak = false;
  showNotes = false;

  // Mock Data for modals
  achievements: Achievement[] = [
    { icon: 'fa-solid fa-handshake', title: 'Joining Letter', description: 'Awarded for joining your first class.', unlocked: true },
    { icon: 'fa-solid fa-person-running', title: 'First Steps', description: 'Complete your first mission.', unlocked: false },
    { icon: 'fa-solid fa-fire', title: 'On a Roll!', description: 'Maintain a 3-day login streak.', unlocked: true },
    { icon: 'fa-solid fa-star', title: 'Employee of the Month', description: 'Maintain a 30-day login streak.', unlocked: false },
  ];

  notes: Note[] = [
    { title: 'Market Analysis Insights', date: '2025-09-15' },
    { title: 'Startup Growth Factors', date: '2025-09-12' },
  ];

  constructor(
    private authService: AuthService,
    public progressService: StudentProgressService,
    private router: Router
  ) {
    this.progress$ = this.progressService.progress$;
    this.isLoading$ = this.progressService.isLoading$;
    this.streakStage$ = this.progressService.streakStage$;
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.welcomeName = user?.user_metadata?.['firstName'] || 'Student';
  }

  toggleAchievements = () => (this.showAchievements = !this.showAchievements);
  toggleStreak = () => (this.showStreak = !this.showStreak);
  toggleNotes = () => (this.showNotes = !this.showNotes);

  // 🔑 Navigate to classes page
  goToClasses() {
    this.router.navigate(['/student/classes']);
  }
}
