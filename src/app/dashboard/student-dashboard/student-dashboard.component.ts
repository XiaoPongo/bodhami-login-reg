import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service'; // Adjust path if needed

interface Achievement {
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
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
  xp: number = 0;
  level: number = 1;
  dashboardImageUrl = 'https://raw.githubusercontent.com/XiaoPongo/bodhami-login-reg/main/student-dashboard.png';
  
  showAchievements = false;

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
      unlocked: false 
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

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    // ... existing ngOnInit logic ...
  }

  toggleAchievements(): void {
    this.showAchievements = !this.showAchievements;
  }
}


