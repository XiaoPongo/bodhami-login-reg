import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Classroom } from '../../services/api.service';

@Component({
  selector: 'app-student-class-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-class-detail.component.html',
  styleUrls: ['./student-class-detail.component.css'],
})
export class StudentClassDetailComponent implements OnInit {
  @Input() classroom!: Classroom;
  @Output() closed = new EventEmitter<void>();
  @Output() left = new EventEmitter<number>();

  activeTab: 'materials' | 'activities' = 'materials';
  isLoading = false;
  error: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadClassContent();
  }

  loadClassContent(): void {
    if (!this.classroom?.id) return;
    this.isLoading = true;
    this.api.getClassrooms().subscribe({
      next: (classes) => {
        const updated = classes.find((c) => c.id === this.classroom.id);
        if (updated) this.classroom = updated;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load class content.';
        this.isLoading = false;
      },
    });
  }

  leaveClass(): void {
    if (!confirm('Are you sure you want to leave this class?')) return;
    this.api.removeStudentFromClass(this.classroom.id, 'me').subscribe({
      next: () => this.left.emit(this.classroom.id),
      error: () => {
        this.error = 'Failed to leave class. Try again.';
      },
    });
  }
}
