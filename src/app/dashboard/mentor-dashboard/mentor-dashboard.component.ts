import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../user';  // path to your User model

@Component({
  selector: 'app-mentor-dashboard',
  templateUrl: './mentor-dashboard.component.html',
  styleUrls: ['./mentor-dashboard.component.css']
})
export class MentorDashboardComponent implements OnInit {
  user: User | null = null;

  classes = [
    { name: 'Math 101' },
    { name: 'Science 201' }
  ];

  topStudents = [
    { name: 'Alice', xp: 1200, progress: 80 },
    { name: 'Bob', xp: 1100, progress: 70 },
    { name: 'Charlie', xp: 950, progress: 60 }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Example: fetch user from localStorage or Supabase session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser) as User;
    } else {
      // fallback dummy user
      this.user = {
        email: 'mentor@example.com',
        firstName: 'John',
        lastName: 'Doe',
        country: 'India',
        postalCode: '403001',
        phone: '9876543210',
        role: 'mentor'
      };
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/create-class']);
  }

  editClass(cls: any): void {
    console.log('Editing class:', cls);
  }

  deleteClass(cls: any): void {
    this.classes = this.classes.filter(c => c !== cls);
  }
}
