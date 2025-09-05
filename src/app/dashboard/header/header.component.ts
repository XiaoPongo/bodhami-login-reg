import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';

// Casted User type with only firstName
interface UserWithFirstName {
  firstName: string;
}

interface Notification {
  id: number;
  text: string;
  date?: string;
  message?: string;
}

interface Deliverable {
  id: number;
  title: string;
  date: string;
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

  // Initialize user using casting to UserWithFirstName
  get user(): UserWithFirstName {
    const u = this.authService.getCurrentUser() as any;
    return { firstName: u?.firstName || 'Guest' };
  }

  @ViewChild('notificationPopup') notificationPopup!: ElementRef;
  @ViewChild('calendarPopup') calendarPopup!: ElementRef;
  @ViewChild('profilePopup') profilePopup!: ElementRef;
  @ViewChild('bellButton') bellButton!: ElementRef;
  @ViewChild('calendarButton') calendarButton!: ElementRef;
  @ViewChild('profileButton') profileButton!: ElementRef;

  constructor(private authService: AuthService) {}

  // Placeholder notifications
  notifications: Notification[] = [
    { id: 1, text: 'New class assigned', date: '2025-09-05', message: 'New class assigned' },
    { id: 2, text: 'Profile updated', date: '2025-09-04', message: 'Profile updated' }
  ];

  // Placeholder deliverables
  deliverables: Deliverable[] = [
    { id: 1, title: 'Submit report', date: '2025-09-10' },
    { id: 2, title: 'Review project', date: '2025-09-15' }
  ];

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

  isDeliverable(month: number, day: number): boolean {
    return this.deliverables.some(del => {
      const delDate = new Date(del.date);
      return delDate.getMonth() + 1 === month && delDate.getDate() === day;
    });
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
