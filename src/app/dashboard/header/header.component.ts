import { Component, ElementRef, HostListener, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../user';
import { SupabaseService } from '../../services/supabase.service';

interface Month {
  name: string;
  startDay: number;
  days: number;
  weeks: number[][];
}

interface Deliverable {
  date: string;
  message?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  showNotification = false;
  showCalendar = false;
  showProfile = false;

  calendarMonths: Month[] = this.generateCalendar(2025);

  notifications: { date: string; message: string }[] = [
    { date: '2025-09-01', message: 'Welcome back!' },
    { date: '2025-09-02', message: 'Meeting at 10 AM' },
    { date: '2025-09-03', message: 'Project deadline tomorrow' }
  ];

  deliverables: Deliverable[] = [
    { date: '2025-09-05', message: 'Submit report' },
    { date: '2025-09-10', message: 'Team presentation' }
  ];

  user: User = {
    firstName: '',
    lastName: '',
    email: '',
    preferences: {
      theme: 'light',
      notifications: true
    }
  };

  @ViewChild('notificationPopup') notificationPopup!: ElementRef;
  @ViewChild('calendarPopup') calendarPopup!: ElementRef;
  @ViewChild('profilePopup') profilePopup!: ElementRef;
  @ViewChild('bellButton') bellButton!: ElementRef;
  @ViewChild('calendarButton') calendarButton!: ElementRef;
  @ViewChild('profileButton') profileButton!: ElementRef;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const { data, error } = await this.supabase.getUser();

    if (error) {
      console.error('Error fetching user:', error.message);
      return;
    }

    if (data?.user) {
      const metadata = data.user.user_metadata || {};

      this.user = {
        firstName: metadata['firstName'] || 'Student',
        lastName: metadata['lastName'] || '',
        email: data.user.email || '',
        preferences: metadata['preferences'] || { theme: 'light', notifications: true }
      };
    }
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
    await this.supabase.signOut();
    window.location.href = '/'; // redirect to login
  }

  isDeliverable(month: number, day: number): boolean {
    return this.deliverables.some((del: Deliverable) => {
      const delDate = new Date(del.date);
      return (delDate.getMonth() + 1) === month && delDate.getDate() === day;
    });
  }

  private generateCalendar(year: number): Month[] {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const daysInMonths = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];

    let currentStartDay = new Date(year, 0, 1).getDay(); // 0 = Sunday
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
    if (this.showNotification && this.notificationPopup && this.bellButton && !this.notificationPopup.nativeElement.contains(event.target) &&
        !this.bellButton.nativeElement.contains(event.target)) {
      this.showNotification = false;
    }
    if (this.showCalendar && this.calendarPopup && this.calendarButton && !this.calendarPopup.nativeElement.contains(event.target) &&
        !this.calendarButton.nativeElement.contains(event.target)) {
      this.showCalendar = false;
    }
    if (this.showProfile && this.profilePopup && this.profileButton && !this.profilePopup.nativeElement.contains(event.target) &&
        !this.profileButton.nativeElement.contains(event.target)) {
      this.showProfile = false;
    }
  }
}
