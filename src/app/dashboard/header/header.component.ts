import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';

interface Month {
  name: string;
  startDay: number;
  days: number;
  weeks: number[][];
}

interface Notification {
  id: number;
  text: string;
  date?: string; // Added to match potential template usage
  message?: string; // Added to match potential template usage
}

interface Deliverable {
  id: number;
  title: string;
  date: string;
}

interface UserPreferences {
  theme?: string;
  notifications?: boolean;
}

interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  preferences?: UserPreferences;
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

  calendarMonths: Month[] = this.generateCalendar(2025);

  @ViewChild('notificationPopup') notificationPopup!: ElementRef;
  @ViewChild('calendarPopup') calendarPopup!: ElementRef;
  @ViewChild('profilePopup') profilePopup!: ElementRef;
  @ViewChild('bellButton') bellButton!: ElementRef;
  @ViewChild('calendarButton') calendarButton!: ElementRef;
  @ViewChild('profileButton') profileButton!: ElementRef;

  constructor(private authService: AuthService) {}

  get user() {
    return this.authService.getCurrentUser();
  }

  get notifications() {
    return [
      { id: 1, text: 'New class assigned', date: '2025-09-05', message: 'New class assigned' },
      { id: 2, text: 'Profile updated', date: '2025-09-04', message: 'Profile updated' }
    ];
  }

  get deliverables() {
    return [
      { id: 1, title: 'Submit report', date: '2025-09-10' },
      { id: 2, title: 'Review project', date: '2025-09-15' }
    ];
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

  isDeliverable(month: number, day: number): boolean {
    return this.deliverables.some((del: any) => {
      const delDate = new Date(del.date);
      return (delDate.getMonth() + 1) === month && delDate.getDate() === day;
    });
  }

  private generateCalendar(year: number): Month[] {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const daysInMonths = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let currentStartDay = new Date(year, 0, 1).getDay();
    const months: Month[] = [];

    for (let m = 0; m < 12; m++) {
      const month: Month = {
        name: monthNames[m],
        startDay: currentStartDay,
        days: daysInMonths[m],
        weeks: []
      };

      const weeks: number[][] = [];
      let week: number[] = Array(7).fill(0);
      let dayIndex = 0;

      for (let i = 0; i < currentStartDay; i++) {
        week[i] = 0;
        dayIndex++;
      }

      for (let d = 1; d <= month.days; d++) {
        week[dayIndex % 7] = d;
        if (dayIndex % 7 === 6 || d === month.days) {
          weeks.push(week);
          week = Array(7).fill(0);
        }
        dayIndex++;
      }

      month.weeks = weeks;
      months.push(month);

      currentStartDay = (currentStartDay + daysInMonths[m]) % 7;
    }

    return months;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.showNotification && !this.notificationPopup.nativeElement.contains(event.target) && !this.bellButton.nativeElement.contains(event.target)) {
      this.showNotification = false;
    }
    if (this.showCalendar && !this.calendarPopup.nativeElement.contains(event.target) && !this.calendarButton.nativeElement.contains(event.target)) {
      this.showCalendar = false;
    }
    if (this.showProfile && !this.profilePopup.nativeElement.contains(event.target) && !this.profileButton.nativeElement.contains(event.target)) {
      this.showProfile = false;
    }
  }
}