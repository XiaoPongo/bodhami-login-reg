import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Import the SupabaseService, same as in your header
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  // Inject the SupabaseService
  constructor(private supabase: SupabaseService) {}

  /**
   * Signs the user out using Supabase and redirects to the home/login page.
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.signOut();
      if (error) {
        // If Supabase returns an error, log it
        console.error('Error signing out:', error.message);
        return;
      }
      // On successful sign-out, redirect the user to the login page
      // Using window.location.href ensures a full page refresh, clearing any state.
      window.location.href = '/login';
    } catch (error) {
      console.error('An unexpected error occurred during sign out:', error);
    }
  }
}
