import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Classroom, Material, Activity } from '../../services/api.service';

@Component({
  selector: 'app-student-class-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-class-detail.component.html',
  styleUrls: ['./student-class-detail.component.css']
})
export class StudentClassDetailComponent {
  @Input() classroom!: Classroom;
  @Output() closed = new EventEmitter<void>();
  @Output() left = new EventEmitter<number>();

  activeTab: 'materials' | 'activities' = 'materials';
  error: string | null = null;

  constructor() {}

  // --- Back button handler ---
  close(): void {
    this.closed.emit();
  }

  // --- Leave class handler ---
  leaveClass(): void {
    if (!confirm(`Are you sure you want to leave ${this.classroom.name}?`)) return;
    // Later we will integrate with ApiService.leaveClass
    this.left.emit(this.classroom.id);
  }

  // --- Download a material ---
  downloadMaterial(material: Material): void {
    if (!material.s3Url) {
      this.error = 'No download link available for this material.';
      setTimeout(() => (this.error = null), 3000);
      return;
    }
    window.open(material.s3Url, '_blank');
  }

  // --- Start an activity ---
  startActivity(activity: Activity): void {
    console.log(`Starting activity: ${activity.title}`);
    this.error = `Activity "${activity.title}" is not implemented yet.`;
    setTimeout(() => (this.error = null), 3000);
  }
}
