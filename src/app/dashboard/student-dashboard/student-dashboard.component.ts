import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { SupabaseService } from '../../services/supabase.service'; // Adjust path if needed

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


@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
})
export class StudentDashboardComponent implements OnInit {
  welcomeName: string = 'Student';
  xp: number = 1250;
  level: number = 5;
  dashboardImageUrl = 'https://raw.githubusercontent.com/XiaoPongo/bodhami-login-reg/main/student-dashboard.png';
   
  showAchievements = false;
  showStreak = false;
  showNotes = false;

  streakDays: number = 6; // Example streak value

  achievements: Achievement[] = [
    { 
      icon: 'fa-solid fa-handshake', 
      title: 'Joining Letter', 
      description: 'Awarded for joining your first class. Welcome aboard!', 
      unlocked: true 
    },
    { 
      icon: 'fa-solid fa-person-running', 
      title: 'First Steps', 
      description: 'Complete your first mission or case study.', 
      unlocked: true 
    },
    { 
      icon: 'fa-solid fa-fire', 
      title: 'On a Roll!', 
      description: 'Maintain a 3-day login streak.', 
      unlocked: true
    },
    { 
      icon: 'fa-solid fa-star', 
      title: 'Employee of the Month', 
      description: 'Maintain a 30-day login streak. Outstanding commitment!', 
      unlocked: false 
    },
    { 
      icon: 'fa-solid fa-brain', 
      title: 'Critical Thinker', 
      description: 'Successfully complete 5 case studies.', 
      unlocked: false 
    },
     { 
      icon: 'fa-solid fa-rocket', 
      title: 'Mission Specialist', 
      description: 'Ace 10 missions with a perfect score.', 
      unlocked: false 
    }
  ];

  notes: Note[] = [
    { title: 'Chapter 1: Market Analysis Insights', date: '2025-09-15' },
    { title: 'Case Study Prep: Startup Growth Factors', date: '2025-09-12' },
    { title: 'Key Takeaways from Financial Models Lecture', date: '2025-09-10' },
    { title: 'SWOT Analysis for Project Alpha', date: '2025-09-08' },
  ];

  // constructor(private supabase: SupabaseService) {}
  constructor() {}

  async ngOnInit() {
    // ... existing ngOnInit logic ...
  }

  toggleAchievements(): void {
    this.showAchievements = !this.showAchievements;
  }

  toggleStreak(): void {
    this.showStreak = !this.showStreak;
  }

  toggleNotes(): void {
    this.showNotes = !this.showNotes;
  }

  get streakStage(): StreakStage {
      if (this.streakDays >= 12) {
          return { name: 'Full Plant', icon: 'fa-solid fa-tree', description: 'Your learning habit is flourishing! Keep it up!', progress: 100 };
      }
      if (this.streakDays >= 8) {
          return { name: 'Young Plant', icon: 'fa-solid fa-seedling', description: 'Growing strong! Consistency is key.', progress: 75 };
      }
      if (this.streakDays >= 4) {
          return { name: 'Sapling', icon: 'fa-solid fa-leaf', description: 'Your streak has sprouted! You are on a roll!', progress: 50 };
      }
      if (this.streakDays >= 1) {
          return { name: 'Seed', icon: 'fa-solid fa-circle-dot', description: 'A new streak has been planted. Come back tomorrow!', progress: 25 };
      }
      return { name: 'No Streak', icon: 'fa-solid fa-circle', description: 'Start a new streak by logging in tomorrow!', progress: 0 };
  }
}
