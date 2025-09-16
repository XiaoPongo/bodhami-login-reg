import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { SupabaseService } from '../../services/supabase.service'; // Assuming you have this service

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

interface StreakStage {
  name: string;
  icon: string;
  description: string;
  progress: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

// Mock User Profile for demonstration
interface UserProfile {
  id: string;
  username: string;
  xp: number;
  level: number;
  streak: number;
}


@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
})
export class StudentDashboardComponent implements OnInit {
  // --- State Properties ---
  isLoading: boolean = true;
  welcomeName: string = 'Student';
  xp: number = 0;
  level: number = 1;
  streakDays: number = 0;
  dashboardImageUrl = 'https://raw.githubusercontent.com/XiaoPongo/bodhami-login-reg/main/student-dashboard.png';
   
  // Modal visibility
  showAchievements = false;
  showStreak = false;
  showNotes = false;
  showQuiz = false;

  // --- Quiz State ---
  currentQuestionIndex: number = 0;
  selectedAnswer: string | null = null;
  quizScore: number = 0;
  isQuizFinished: boolean = false;


  // --- Data Properties ---
  achievements: Achievement[] = [
    { icon: 'fa-solid fa-handshake', title: 'Joining Letter', description: 'Awarded for joining your first class.', unlocked: true },
    { icon: 'fa-solid fa-person-running', title: 'First Steps', description: 'Complete your first mission.', unlocked: true },
    { icon: 'fa-solid fa-fire', title: 'On a Roll!', description: 'Maintain a 3-day login streak.', unlocked: true },
    { icon: 'fa-solid fa-star', title: 'Employee of the Month', description: 'Maintain a 30-day login streak.', unlocked: false },
    { icon: 'fa-solid fa-brain', title: 'Critical Thinker', description: 'Complete 5 case studies.', unlocked: false },
    { icon: 'fa-solid fa-rocket', title: 'Mission Specialist', description: 'Ace 10 missions.', unlocked: false }
  ];

  notes: Note[] = [
    { title: 'Chapter 1: Market Analysis Insights', date: '2025-09-15' },
    { title: 'Case Study Prep: Startup Growth Factors', date: '2025-09-12' },
    { title: 'Key Takeaways from Financial Models Lecture', date: '2025-09-10' },
  ];

  quizQuestions: QuizQuestion[] = [
    { question: "What is the primary goal of a SWOT analysis?", options: ["To forecast sales", "To analyze competitors", "To identify internal and external factors", "To set marketing budgets"], correctAnswer: "To identify internal and external factors" },
    { question: "Which of the following is a key component of a business plan?", options: ["Daily work schedule", "Executive Summary", "Employee contact list", "Office supply inventory"], correctAnswer: "Executive Summary" },
    { question: "In project management, what does 'Scope Creep' refer to?", options: ["The project finishing early", "The budget being reduced", "Uncontrolled changes or growth in a project's scope", "A team member leaving"], correctAnswer: "Uncontrolled changes or growth in a project's scope" },
    { question: "What does ROI stand for?", options: ["Return on Investment", "Rate of Inflation", "Risk of Insolvency", "Revenue of Interest"], correctAnswer: "Return on Investment" },
    { question: "Which market structure is characterized by a single seller?", options: ["Oligopoly", "Monopoly", "Perfect Competition", "Monopolistic Competition"], correctAnswer: "Monopoly" }
  ];

  // constructor(private supabase: SupabaseService) {}
  constructor() {}

  async ngOnInit() {
    await this.fetchStudentProfile();
    this.isLoading = false;
  }

  // --- Data Fetching ---
  async fetchStudentProfile() {
    // In a real app, this would call your service:
    // const userProfile = await this.supabase.getProfile();
    
    // For demonstration, we'll use mock data after a short delay.
    const mockProfile: UserProfile = {
      id: 'user-123',
      username: 'Alex',
      xp: 1250,
      level: 5,
      streak: 6,
    };
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    if (mockProfile) {
      this.welcomeName = mockProfile.username;
      this.xp = mockProfile.xp;
      this.level = mockProfile.level;
      this.streakDays = mockProfile.streak;
    }
  }

  // --- UI Toggles ---
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

  // --- Streak Logic ---
  get streakStage(): StreakStage {
      if (this.streakDays >= 12) return { name: 'Full Plant', icon: 'fa-solid fa-tree', description: 'Your learning habit is flourishing!', progress: 100 };
      if (this.streakDays >= 8) return { name: 'Young Plant', icon: 'fa-solid fa-seedling', description: 'Growing strong! Consistency is key.', progress: 75 };
      if (this.streakDays >= 4) return { name: 'Sapling', icon: 'fa-solid fa-leaf', description: 'Your streak has sprouted!', progress: 50 };
      if (this.streakDays >= 1) return { name: 'Seed', icon: 'fa-solid fa-circle-dot', description: 'A new streak has been planted.', progress: 25 };
      return { name: 'No Streak', icon: 'fa-solid fa-circle', description: 'Start a new streak!', progress: 0 };
  }

  // --- Quiz Logic ---
  selectAnswer(option: string) {
    this.selectedAnswer = option;
  }

  nextQuestion() {
    // Check answer and update score
    if (this.selectedAnswer === this.quizQuestions[this.currentQuestionIndex].correctAnswer) {
      this.quizScore++;
    }

    // Move to next question or finish
    if (this.currentQuestionIndex < this.quizQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswer = null;
    } else {
      this.isQuizFinished = true;
      // Optional: Award XP based on score
      const earnedXp = this.quizScore * 10;
      this.xp += earnedXp;
      // Here you might call a service to save the new XP
      // await this.supabase.updateProfile({ xp: this.xp });
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

