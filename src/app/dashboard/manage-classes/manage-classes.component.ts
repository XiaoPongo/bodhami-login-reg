import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { ClassService } from '../../services/class.service';
import { Classroom, Student, Activity, Material } from '../../services/api.service';

type ToastType = 'success' | 'error';

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

  toast = { isVisible: false, message: '', type: 'success' as ToastType };
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
      // Ensure the service's selected class is synced with the URL
      if (this.classService.getSelectedClassId() !== classId) {
        this.classService.selectClass(classId);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }
  
  handleRefresh(): void {
    this.showToast('Refreshing class list...', 'success');
    this.classService.loadClasses();
  }

  handleSelectClass(classId: number): void {
    // Only navigate if the route is different to avoid unnecessary reloads
    if (this.route.snapshot.queryParams['classId'] != classId) {
        this.router.navigate([], { queryParams: { classId: classId } });
    }
    this.isEditingClass = false; // Always exit edit mode on class switch
  }
  
  handleCreateClass(): void {
    if (this.newClassName.trim()) {
      this.classService.createClass(this.newClassName, this.newClassDescription)
        .subscribe({
          next: (newClass) => {
            this.showToast(`Class "${newClass.name}" created successfully!`, 'success');
            this.closeCreateModal();
            // Navigate to the newly created class
            this.router.navigate([], { queryParams: { classId: newClass.id } });
          },
          error: (err) => {
            console.error("Failed to create class:", err);
            this.showToast('Error: Could not create class.', 'error');
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
      .subscribe({
        next: () => {
          this.showToast('Class updated successfully!', 'success');
          this.isEditingClass = false;
        },
        error: (err) => this.showToast('Error updating class.', 'error')
      });
  }
  
  handleCancelEdit(): void {
    this.isEditingClass = false;
  }
  
  // --- THIS IS THE FIX: The missing method is now implemented ---
  openConfirmModal(action: string, id: number, data: any) {
    switch(action) {
      case 'deleteClass':
        this.confirmModal = {
          isOpen: true,
          title: 'Delete Class',
          message: `Are you sure you want to permanently delete <strong>"${data.className}"</strong>? This action cannot be undone.`,
          onConfirm: () => {
            this.classService.deleteClass(id).subscribe({
              next: () => {
                if (this.route.snapshot.queryParams['classId'] == id) {
                  this.router.navigate([], { queryParams: {} });
                }
                this.showToast('Class deleted successfully.', 'success');
              },
              error: err => this.showToast('Error deleting class.', 'error')
            });
            this.closeConfirmModal();
          }
        };
        break;
      case 'removeStudent':
        this.confirmModal = {
          isOpen: true,
          title: 'Remove Student',
          message: `Are you sure you want to remove <strong>${data.student.name}</strong> from this class?`,
          onConfirm: () => {
            this.classService.removeStudent(id, data.student.id).subscribe({
              next: () => this.showToast(`${data.student.name} has been removed.`, 'success'),
              error: err => this.showToast('Error removing student.', 'error')
            });
            this.closeConfirmModal();
          }
        };
        break;
      case 'unassignActivity':
        this.confirmModal = {
          isOpen: true,
          title: 'Unassign Activity',
          message: `Are you sure you want to unassign <strong>"${data.activity.title}"</strong>?`,
          onConfirm: () => {
            this.classService.unassignActivity(id, data.activity.id).subscribe({
              next: () => this.showToast(`Activity unassigned.`, 'success'),
              error: err => this.showToast('Error unassigning activity.', 'error')
            });
            this.closeConfirmModal();
          }
        };
        break;
    }
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
  
  showToast(message: string, type: ToastType): void {
    this.toast = { isVisible: true, message, type };
    setTimeout(() => { this.toast.isVisible = false; }, 3000);
  }
}

