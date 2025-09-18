import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Classroom } from '../../services/api.service';
import { StudentClassDetailComponent } from '../student-class-detail/student-class-detail.component';

@Component({
  selector: 'app-student-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, StudentClassDetailComponent],
  templateUrl: './student-classes.component.html',
  styleUrls: ['./student-classes.component.css'],
})
export class StudentClassesComponent implements OnInit {
  enrolledClasses: Classroom[] = [];
  query: string = '';

  // UI state
  isLoading = false;
  joining = false;
  joinCode = '';
  joinError: string | null = null;
  joinSuccessMsg: string | null = null;

  // selected class for detail view
  selectedClass: Classroom | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadClasses();
  }

  /** 🔹 Fetch enrolled classes from API */
  loadClasses(): void {
    this.isLoading = true;
    this.api.getEnrolledClasses().subscribe({
      next: (classes: Classroom[]) => {
        this.enrolledClasses = classes;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  /** 🔹 Open modal */
  openJoinModal(): void {
    this.joining = true;
    this.joinCode = '';
    this.joinError = null;
    this.joinSuccessMsg = null;
  }

  /** 🔹 Close modal */
  closeJoinModal(): void {
    this.joining = false;
  }

  /** 🔹 Submit join request */
  submitJoinCode(): void {
    if (!this.joinCode.trim()) {
      this.joinError = 'Please enter a class code.';
      return;
    }

    this.api.joinClass(this.joinCode).subscribe({
      next: (res) => {
        if (res.success) {
          this.joinSuccessMsg = 'Welcome! You have joined the class 🎉';
          this.joinError = null;
          this.loadClasses();
          setTimeout(() => this.closeJoinModal(), 1500);
        } else {
          this.joinError = res.message || 'Invalid or expired code.';
        }
      },
      error: () => {
        this.joinError = 'Something went wrong. Please try again.';
      },
    });
  }

  /** 🔹 Search filter */
  get filteredClasses(): Classroom[] {
    const q = this.query.toLowerCase();
    return this.enrolledClasses.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.mentorId.toLowerCase().includes(q)
    );
  }

  /** 🔹 Refresh */
  refresh(): void {
    this.loadClasses();
  }

  /** 🔹 Open detail */
  openClass(c: Classroom): void {
    this.selectedClass = c;
  }

  /** 🔹 Close detail */
  onCloseDetail(): void {
    this.selectedClass = null;
  }

  /** 🔹 After leaving a class */
  onLeaveClass(classId: number): void {
    this.enrolledClasses = this.enrolledClasses.filter((c) => c.id !== classId);
    this.selectedClass = null;
  }
}
