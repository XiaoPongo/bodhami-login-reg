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

  toast = { isVisible: false, message: '', type: 'success' };
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
      const classId = params['classId'] ? Number(params['classId']) : null;
      this.classService.selectClass(classId);
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }
  
  // --- NEW: Manual Refresh ---
  handleRefresh(): void {
    this.showToast('Refreshing class list...', 'success');
    this.classService.loadClasses();
  }

  handleSelectClass(classId: number): void {
    if (this.route.snapshot.queryParams['classId'] != classId) {
        this.router.navigate([], { queryParams: { classId: classId } });
    } else {
        this.classService.selectClass(classId);
    }
    this.isEditingClass = false;
  }

  handleDeleteClass(classId: number, className: string): void {
    this.confirmModal = {
      isOpen: true,
      title: 'Delete Class',
      message: `Are you sure you want to permanently delete <strong>"${className}"</strong>? This action cannot be undone.`,
      onConfirm: () => {
        this.classService.deleteClass(classId).subscribe(() => {
          if (this.route.snapshot.queryParams['classId'] == classId) {
             this.router.navigate([], { queryParams: {} });
          }
          this.showToast('Class deleted successfully.', 'success');
          this.closeConfirmModal();
        });
      }
    };
  }

  handleCreateClass(): void {
    if (this.newClassName.trim()) {
      this.classService.createClass(this.newClassName, this.newClassDescription)
        .subscribe({
          next: (newClass) => {
            this.showToast(`Class "${newClass.name}" created successfully!`, 'success');
            this.closeCreateModal();
          },
          error: (err) => {
            console.error("Failed to create class:", err);
            this.showToast('Error: Could not create the class.', 'error');
          }
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
        this.showToast('Class updated successfully!', 'success');
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
          this.showToast(`${student.name} has been removed.`, 'success');
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
          this.showToast(`Material unassigned.`, 'success');
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
          this.showToast(`Activity unassigned.`, 'success');
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
      this.showToast(`Code "${code}" copied to clipboard!`, 'success');
    });
  }
  
  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toast = { isVisible: true, message, type };
    setTimeout(() => { this.toast.isVisible = false; }, 3000);
  }
}

