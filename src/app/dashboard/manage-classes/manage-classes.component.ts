import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ClassService } from '../../services/class.service';
import { Classroom, Student } from '../../services/api.service'; // Corrected import

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
  
  // These properties now match the template
  isCreateModalOpen = false;
  isAddStudentModalOpen = false;
  
  newClassName = '';
  newClassDescription = '';
  newStudentEmail = '';

  private classesSubscription: Subscription | undefined;

  constructor(private classService: ClassService) {}

  ngOnInit(): void {
    // Correctly subscribe to the live stream of classes
    this.classesSubscription = this.classService.classes$.subscribe((classes: Classroom[]) => {
      // Sort by ID descending to show newest first
      this.classes = classes.sort((a: Classroom, b: Classroom) => (b.id ?? 0) - (a.id ?? 0));
    });
  }

  ngOnDestroy(): void {
    this.classesSubscription?.unsubscribe();
  }

  selectClass(classroom: Classroom): void {
    this.selectedClass = classroom;
  }
  
  // --- ADDED MISSING METHODS ---
  unselectClass(): void {
    this.selectedClass = null;
  }

  copyCode(code: string | undefined): void {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      alert(`Code "${code}" copied to clipboard!`);
    });
  }

  // --- RENAMED & CORRECTED METHODS ---
  handleCreateClass(): void {
    if (this.newClassName.trim()) {
      this.classService.createClass(this.newClassName, this.newClassDescription)
        .subscribe(() => this.closeCreateModal());
    }
  }

  handleAddStudent(): void {
    if (this.selectedClass?.id && this.newStudentEmail.trim()) {
      this.classService.addStudentToClass(this.selectedClass.id, this.newStudentEmail)
        .subscribe(() => {
          console.log('Student added!');
          this.closeAddStudentModal();
        });
    }
  }

  handleRemoveStudent(studentId: string): void {
    if (this.selectedClass?.id) {
        if (confirm('Are you sure you want to remove this student?')) {
            this.classService.removeStudentFromClass(this.selectedClass.id, studentId)
              .subscribe(() => console.log('Student removed!'));
        }
    }
  }

  // --- MODAL CONTROLS (Standardized) ---
  openCreateModal(): void {
    this.isCreateModalOpen = true;
    this.newClassName = '';
    this.newClassDescription = '';
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  openAddStudentModal(): void {
    this.isAddStudentModalOpen = true;
    this.newStudentEmail = '';
  }
  
  closeAddStudentModal(): void {
    this.isAddStudentModalOpen = false;
  }
}