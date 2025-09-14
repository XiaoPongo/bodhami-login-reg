import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ClassService } from '../../services/class.service';
// Correctly import data models from the single source of truth: api.service
import { Classroom, Student } from '../../services/api.service';

@Component({
  selector: 'app-manage-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-classes.component.html',
  styleUrls: ['./manage-classes.component.css'],
})
export class ManageClassesComponent implements OnInit, OnDestroy {
  classes: Classroom[] = [];
  selectedClass: Classroom | null = null;
  students: Student[] = [];
  
  showCreateModal = false;
  showManageModal = false;
  newClassName = '';
  newClassDescription = '';
  newStudentEmail = '';
  newStudentName = ''; // Assuming you might want to add name as well

  private classesSubscription: Subscription | undefined;

  constructor(private classService: ClassService) {}

  ngOnInit(): void {
    // Correctly subscribe to the live stream of classes
    this.classesSubscription = this.classService.classes$.subscribe(classes => {
      // The sort logic was missing type info, which is now fixed.
      // Also assuming a 'createdAt' property will exist on the model. If not, sort by 'id' or 'name'.
      this.classes = classes.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    });
  }

  ngOnDestroy(): void {
    // Clean up the subscription to prevent memory leaks
    this.classesSubscription?.unsubscribe();
  }

  selectClass(classroom: Classroom): void {
    this.selectedClass = classroom;
    // Mock student loading for now
    this.students = [
        { id: 'student1', name: 'Alice Johnson', email: 'alice@example.com', xp: 1200 },
        { id: 'student2', name: 'Bob Williams', email: 'bob@example.com', xp: 950 }
    ];
  }

  // --- Form submission methods ---
  handleCreateClass(): void {
    if (this.newClassName.trim()) {
      this.classService.createClass(this.newClassName, this.newClassDescription)
        .subscribe(() => {
          this.closeCreateModal();
        });
    }
  }

  handleAddStudent(): void {
    if (this.selectedClass?.id && this.newStudentEmail.trim() && this.newStudentName.trim()) {
      this.classService.addStudentToClass(this.selectedClass.id, this.newStudentEmail, this.newStudentName)
        .subscribe(() => {
          // Add logic to refresh student list
          this.newStudentEmail = '';
          this.newStudentName = '';
        });
    }
  }

  removeStudent(studentId: string): void {
    if (this.selectedClass?.id) {
        if (confirm('Are you sure you want to remove this student?')) {
            this.classService.removeStudentFromClass(this.selectedClass.id, studentId)
              .subscribe(() => {
                // Add logic to refresh student list
              });
        }
    }
  }

  // --- Modal controls ---
  openCreateModal(): void {
    this.showCreateModal = true;
    this.newClassName = '';
    this.newClassDescription = '';
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  openManageModal(): void {
    if (this.selectedClass) {
      this.showManageModal = true;
    }
  }
  
  closeManageModal(): void {
    this.showManageModal = false;
  }
}