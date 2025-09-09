import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service'; // Adjust path if needed
import { User } from '../../user'; // Adjust path if needed

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
})
export class StudentDashboardComponent implements OnInit {
  user: User | null = null;
  xp = 0;
  level = 1;

  // Define the direct URL to the raw image file
  backgroundImageUrl = 'https://raw.githubusercontent.com/XiaoPongo/bodhami-login-reg/main/student-dashboard.png';

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const { data, error } = await this.supabase.getUser();
    if (data?.user) {
      const metadata = data.user.user_metadata || {};
      this.user = {
        firstName: metadata['firstName'] || 'Student',
        lastName: metadata['lastName'] || '',
        email: data.user.email || '',
      };
      // In the future, you would fetch these values from Supabase
      this.xp = metadata['xp'] || 0;
      this.level = metadata['level'] || 1;
    }
  }
}

