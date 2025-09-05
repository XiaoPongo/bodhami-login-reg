import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';

// Only firstName is needed
interface UserWithFirstName {
  firstName: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  showNotification = false;
  showCalendar = false;
  showProfile = false;

  @ViewChild('notificationPopup') notificationPopup!: ElementRef;
  @ViewChild('calendarPopup') calendarPopup!: ElementRef;
  @ViewChild('profilePopup') profilePopup!: ElementRef;
  @ViewChild('bellButton') bellButton!: ElementRef;
  @ViewChild('calendarButton') calendarButton!: ElementRef;
  @ViewChild('profileButton') profileButton!: ElementRef;

  constructor(private authService: AuthService) {}

  // Safe retrieval of firstName only
  get user(): UserWithFirstName {
    const u = this.authService.getCurrentUser() as any;
    return { firstName: u?.firstName || 'Guest' };
  }

  toggleNotification() {
    this.showNotification = !this.showNotification;
    this.showCalendar = false;
    this.showProfile = false;
  }

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
    this.showNotification = false;
    this.showProfile = false;
  }

  toggleProfile() {
    this.showProfile = !this.showProfile;
    this.showNotification = false;
    this.showCalendar = false;
  }

  async signOut() {
    await this.authService.logout();
    console.log('Signed out');
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.showNotification && !this.notificationPopup.nativeElement.contains(event.target) &&
        !this.bellButton.nativeElement.contains(event.target)) {
      this.showNotification = false;
    }
    if (this.showCalendar && !this.calendarPopup.nativeElement.contains(event.target) &&
        !this.calendarButton.nativeElement.contains(event.target)) {
      this.showCalendar = false;
    }
    if (this.showProfile && !this.profilePopup.nativeElement.contains(event.target) &&
        !this.profileButton.nativeElement.contains(event.target)) {
      this.showProfile = false;
    }
  }
}
