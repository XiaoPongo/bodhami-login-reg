import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ClassService, Classroom, Student } from '../../services/class.service';

@Component({
  selector: 'app-manage-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-classes.component.html',
  styleUrls: ['./manage-classes.component.css']
})
export class ManageClassesComponent implements OnInit, OnDestroy {
  // Component State
  classes: Classroom[] = [];
  selectedClass: Classroom | null = null;
  isCreateModalOpen = false;
  isAddStudentModalOpen = false;

  // Form Models
  newClassName = '';
  newClassDescription = '';
  newStudentName = '';
  newStudentEmail = '';

  private classSubscription!: Subscription;

  constructor(private classService: ClassService) {}

  ngOnInit(): void {
    this.classSubscription = this.classService.getClasses().subscribe(classes => {
      this.classes = classes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    });
  }

  ngOnDestroy(): void {
    if (this.classSubscription) {
      this.classSubscription.unsubscribe();
    }
  }

  // --- Class Management ---
  handleCreateClass() {
    if (!this.newClassName.trim()) return;
    this.classService.createClass(this.newClassName, this.newClassDescription).subscribe({
      next: (newClass) => {
        console.log('Class created:', newClass);
        this.closeCreateModal();
        this.selectClass(newClass); // Automatically select the new class
      },
      error: (err) => console.error('Failed to create class', err)
    });
  }

  selectClass(classToSelect: Classroom) {
    this.selectedClass = classToSelect;
  }
  
  unselectClass() {
    this.selectedClass = null;
  }

  // --- Student Management ---
  handleAddStudent() {
    if (!this.newStudentEmail.trim() || !this.newStudentName.trim() || !this.selectedClass) return;

    this.classService.addStudentToClass(this.selectedClass.id, this.newStudentEmail, this.newStudentName).subscribe(success => {
      if (success) {
        console.log('Student added');
        // The BehaviorSubject in the service will automatically update the view
        this.closeAddStudentModal();
      } else {
        alert('Failed to add student. They may already be in the class.');
      }
    });
  }
  
  handleRemoveStudent(studentId: string) {
    if (!this.selectedClass) return;
    if (confirm('Are you sure you want to remove this student?')) {
      this.classService.removeStudentFromClass(this.selectedClass.id, studentId).subscribe();
    }
  }
  
  // --- UI & Modal Controls ---
  openCreateModal() { this.isCreateModalOpen = true; }
  closeCreateModal() {
    this.isCreateModalOpen = false;
    this.newClassName = '';
    this.newClassDescription = '';
  }

  openAddStudentModal() { this.isAddStudentModalOpen = true; }
  closeAddStudentModal() {
    this.isAddStudentModalOpen = false;
    this.newStudentName = '';
    this.newStudentEmail = '';
  }

  copyCode(classCode: string) {
    navigator.clipboard.writeText(classCode).then(() => {
      alert(`Code "${classCode}" copied to clipboard!`);
    }).catch(err => {
      console.error('Failed to copy code: ', err);
    });
  }
}
