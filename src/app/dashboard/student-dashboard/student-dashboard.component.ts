import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
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
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
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
  
  // Corrected Background Image URL
  dashboardImageUrl = 'https://raw.githubusercontent.com/XiaoPongo/bodhami-login-reg/main/student-dashboard-new.png';
   
  progress$: Observable<StudentProgress | null>;
  streakStage$: Observable<StreakStage>;

  // Modal visibility
  showAchievements = false;
  showStreak = false;
  showNotes = false;
  showQuiz = false;

  // Quiz State
  currentQuestionIndex: number = 0;
  selectedAnswer: string | null = null;
  quizScore: number = 0;
  isQuizFinished: boolean = false;

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
  quizQuestions: QuizQuestion[] = [
    { question: "What is the primary goal of a SWOT analysis?", options: ["To forecast sales", "To analyze competitors", "To identify internal and external factors", "To set marketing budgets"], correctAnswer: "To identify internal and external factors" },
    { question: "Which is a key component of a business plan?", options: ["Work schedule", "Executive Summary", "Contact list", "Supply inventory"], correctAnswer: "Executive Summary" },
    { question: "What does ROI stand for?", options: ["Return on Investment", "Rate of Inflation", "Risk of Insolvency", "Revenue of Interest"], correctAnswer: "Return on Investment" },
  ];

  constructor(
    private authService: AuthService,
    public progressService: StudentProgressService
  ) {
    this.progress$ = this.progressService.progress$;
    this.isLoading$ = this.progressService.isLoading$;
    this.streakStage$ = this.progressService.streakStage$;
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.welcomeName = user?.user_metadata?.['firstName'] || 'Student';
  }

  toggleAchievements = () => this.showAchievements = !this.showAchievements;
  toggleStreak = () => this.showStreak = !this.showStreak;
  toggleNotes = () => this.showNotes = !this.showNotes;
  
  startQuiz() {
    this.resetQuiz();
    this.showQuiz = true;
  }
  exitQuiz() {
    this.showQuiz = false;
  }

  selectAnswer(option: string) { this.selectedAnswer = option; }

  nextQuestion() {
    if (this.selectedAnswer === this.quizQuestions[this.currentQuestionIndex].correctAnswer) {
      this.quizScore++;
    }
    if (this.currentQuestionIndex < this.quizQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswer = null;
    } else {
      this.isQuizFinished = true;
      const earnedXp = this.quizScore * 10;
      this.progressService.addXp(earnedXp);
    }
  }

  resetQuiz() {
    this.currentQuestionIndex = 0;
    this.selectedAnswer = null;
    this.quizScore = 0;
    this.isQuizFinished = false;
  }

  get quizProgress(): number {
    return ((this.currentQuestionIndex + 1) / this.quizQuestions.length) * 100;
  }
}

