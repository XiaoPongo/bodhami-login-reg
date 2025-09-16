import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// CRITICAL FIX: Import the unified AuthService.
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  // CRITICAL FIX: Inject the unified AuthService.
  constructor(private authService: AuthService) {}

  /**
   * Signs the user out and redirects to the home/login page.
   */
  async signOut(): Promise<void> {
    try {
      // CRITICAL FIX: Call the logout method from the AuthService.
      const { error } = await this.authService.logout();
      if (error) {
        console.error('Error signing out:', error.message);
        return;
      }
      window.location.href = '/login';
    } catch (error) {
      console.error('An unexpected error occurred during sign out:', error);
    }
  }
}
