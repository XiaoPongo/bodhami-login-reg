import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ClassService } from '../../services/class.service';
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
  
  // --- ADDED MISSING PROPERTIES ---
  isCreateModalOpen = false;
  isAddStudentModalOpen = false;
  newClassName = '';
  newClassDescription = '';
  newStudentEmail = '';
  newStudentName = '';

  private classesSubscription: Subscription | undefined;

  constructor(private classService: ClassService) {}

  ngOnInit(): void {
    this.classesSubscription = this.classService.classes$.subscribe((classes: Classroom[]) => {
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
  
  // --- MODAL CONTROLS ---
  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }
  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }
  openAddStudentModal(): void {
    this.isAddStudentModalOpen = true;
  }
  closeAddStudentModal(): void {
    this.isAddStudentModalOpen = false;
  }
}