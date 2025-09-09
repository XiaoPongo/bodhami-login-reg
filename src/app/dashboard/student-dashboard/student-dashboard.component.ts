import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service'; // Assuming you have this service

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
})
export class StudentDashboardComponent implements OnInit {
  user: any = null;
  xp: number = 0; // Default value
  level: number = 1; // Default value

  constructor(private supabase: SupabaseService) {}

  ngOnInit(): void {
    this.fetchStudentData();
  }

  async fetchStudentData() {
    // This is where you would fetch the user and their progress from Supabase
    // For now, it just sets default values.
    const { data, error } = await this.supabase.getUser();
    if (data?.user) {
      this.user = data.user;
      // Replace with actual fetching of xp and level from your db
      this.xp = data.user.user_metadata?.['xp'] || 0;
      this.level = data.user.user_metadata?.['level'] || 1;
    }
    if (error) {
      console.error('Error fetching user data:', error);
    }
  }

  startQuiz() {
    console.log('Starting quiz...');
    // Future: Navigate to the quiz page
  }

  viewAchievements() {
    console.log('Viewing achievements...');
    // Future: Navigate to the achievements page
  }
}