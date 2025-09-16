import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { ClassService } from '../../services/class.service';
import { Classroom, Student, Activity, Material } from '../../services/api.service';

@Component({
  selector: 'app-manage-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './manage-classes.component.html',
  styleUrls: ['./manage-classes.component.css'],
})
export class ManageClassesComponent implements OnInit, OnDestroy {
  public classes$: Observable<Classroom[]>;
  public selectedClass$: Observable<Classroom | null>;
  public isLoading$: Observable<boolean>;

  isCreateModalOpen = false;
  newClassName = '';
  newClassDescription = '';
  
  isEditingClass = false;
  editableClassName = '';
  editableClassDescription = '';

  activeContentTab: 'students' | 'materials' | 'activities' = 'students';

  toast = { isVisible: false, message: '' };
  confirmModal = { isOpen: false, title: '', message: '', onConfirm: () => {} };
  
  private routeSub: Subscription | undefined;

  constructor(
    public classService: ClassService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.classes$ = this.classService.classes$;
    this.selectedClass$ = this.classService.selectedClass$;
    this.isLoading$ = this.classService.isLoading$;
  }

  ngOnInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      const classId = params['classId'];
      if (classId) {
        this.classService.selectClass(Number(classId));
      } else {
        this.classService.selectClass(null);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  handleSelectClass(classId: number): void {
    this.router.navigate([], { queryParams: { classId: classId } });
    this.isEditingClass = false; // Ensure we exit edit mode when switching classes
  }

  handleDeleteClass(classId: number, className: string): void {
    this.confirmModal = {
      isOpen: true,
      title: 'Delete Class',
      message: `Are you sure you want to permanently delete <strong>"${className}"</strong>? This action cannot be undone.`,
      onConfirm: () => {
        this.classService.deleteClass(classId).subscribe(() => {
          // If the deleted class was selected, clear the query params
          if (this.route.snapshot.queryParams['classId'] == classId) {
             this.router.navigate([], { queryParams: {} });
          }
          this.showToast('Class deleted successfully.');
          this.closeConfirmModal();
        });
      }
    };
  }

  handleCreateClass(): void {
    if (this.newClassName.trim()) {
      this.classService.createClass(this.newClassName, this.newClassDescription)
        .subscribe(() => {
            this.showToast('Class created successfully!');
            this.closeCreateModal();
        });
    }
  }
  
  handleEditClass(currentClass: Classroom): void {
    this.isEditingClass = true;
    this.editableClassName = currentClass.name;
    this.editableClassDescription = currentClass.description;
  }
  
  handleSaveClass(classId: number): void {
    if (!this.editableClassName.trim()) return;
    this.classService.updateClass(classId, this.editableClassName, this.editableClassDescription)
      .subscribe(() => {
        this.showToast('Class updated successfully!');
        this.isEditingClass = false;
      });
  }
  
  handleCancelEdit(): void {
    this.isEditingClass = false;
  }
  
  handleRemoveStudent(classId: number, student: Student): void {
     this.confirmModal = {
      isOpen: true,
      title: 'Remove Student',
      message: `Are you sure you want to remove <strong>${student.name}</strong> from this class?`,
      onConfirm: () => {
        this.classService.removeStudent(classId, student.id).subscribe(() => {
          this.showToast(`${student.name} has been removed.`);
          this.closeConfirmModal();
        });
      }
    };
  }

  handleUnassignMaterial(classId: number, material: Material): void {
      this.confirmModal = {
      isOpen: true,
      title: 'Unassign Material',
      message: `Are you sure you want to unassign <strong>"${material.displayName}"</strong>?`,
      onConfirm: () => {
        this.classService.unassignMaterial(classId, material.id).subscribe(() => {
          this.showToast(`Material unassigned.`);
          this.closeConfirmModal();
        });
      }
    };
  }

  handleUnassignActivity(classId: number, activity: Activity): void {
      this.confirmModal = {
      isOpen: true,
      title: 'Unassign Activity',
      message: `Are you sure you want to unassign <strong>"${activity.title}"</strong>?`,
      onConfirm: () => {
        this.classService.unassignActivity(classId, activity.id).subscribe(() => {
          this.showToast(`Activity unassigned.`);
          this.closeConfirmModal();
        });
      }
    };
  }
  
  openCreateModal(): void { this.isCreateModalOpen = true; }
  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.newClassName = '';
    this.newClassDescription = '';
  }
  
  closeConfirmModal(): void { this.confirmModal.isOpen = false; }
  
  setActiveTab(tab: 'students' | 'materials' | 'activities'): void { this.activeContentTab = tab; }

  copyCode(code: string | undefined): void {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      this.showToast(`Code "${code}" copied to clipboard!`);
    });
  }
  
  showToast(message: string): void {
    this.toast = { isVisible: true, message };
    setTimeout(() => { this.toast.isVisible = false; }, 3000);
  }
}

