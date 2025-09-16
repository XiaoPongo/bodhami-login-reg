import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpEventType, HttpEvent } from '@angular/common/http';
import { ApiService, Classroom, Material } from '../../services/api.service';
import { ClassService } from '../../services/class.service';
import { MaterialService } from '../../services/material.service';

interface UploadableFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  subscription?: Subscription;
  classId: number;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

@Component({
  selector: 'app-upload-material',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-material.component.html',
  styleUrls: ['./upload-material.component.css']
})
export class UploadMaterialComponent implements OnInit, OnDestroy {
  
  filesToUpload: UploadableFile[] = [];
  isDragging = false;
  uploadTargetClassId: string = ''; 
  
  selectedClassFilter: string = 'all';

  classes$: Observable<Classroom[]>;
  materials$: Observable<Material[]>;
  filteredMaterials$: Observable<Material[]>;
  isLoading$: Observable<boolean>;
  
  private allClasses: Classroom[] = [];
  public filter = new BehaviorSubject<string>('all');
  private subscriptions = new Subscription();

  selectedFileIds = new Set<number>();
  showBulkToolbar = false;
  isAssignModalOpen = false;
  assignTargetClassId: string = '';
  
  notification: Notification | null = null;
  private notificationTimeout: any;

  confirmModal = { isOpen: false, title: '', message: '', onConfirm: () => {} };

  constructor(
    private apiService: ApiService, 
    public classService: ClassService,
    public materialService: MaterialService
  ) {
    this.classes$ = this.classService.classes$;
    this.materials$ = this.materialService.materials$;
    this.isLoading$ = this.materialService.isLoading$;

    this.filteredMaterials$ = combineLatest([this.materials$, this.filter]).pipe(
      map(([materials, filterValue]) => {
        if (filterValue === 'all') return materials;
        if (filterValue === 'unassigned') return materials.filter(m => !m.classroom);
        return materials.filter(m => m.classroom?.id === Number(filterValue));
      })
    );
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.classes$.subscribe(classes => {
        this.allClasses = classes;
      })
    );
    this.handleRefresh();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.filesToUpload.forEach(f => f.subscription?.unsubscribe());
  }

  handleRefresh(): void {
    this.showNotificationBanner('success', 'Refreshing materials...');
    this.materialService.loadMaterials();
    this.classService.loadClasses();
  }

  onFilterChange(filterValue: string): void {
    this.filter.next(filterValue);
  }
  
  getClassNameById(classId: number | null | undefined): string {
    if (classId === null || classId === undefined) return 'Unassigned';
    const foundClass = this.allClasses.find(c => c.id === classId);
    return foundClass ? foundClass.name : 'Unknown Class';
  }

  // --- File Upload Logic ---
  onDragOver(event: DragEvent) { event.preventDefault(); if (this.uploadTargetClassId) this.isDragging = true; }
  onDragLeave(event: DragEvent) { event.preventDefault(); this.isDragging = false; }
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files) this.handleFiles(event.dataTransfer.files);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) this.handleFiles(input.files);
    input.value = '';
  }

  handleFiles(files: FileList) {
    if (!this.uploadTargetClassId) {
      this.showNotificationBanner('error', 'Please select a class before choosing files.');
      return;
    }
    const allowedExtensions = ['.pdf', '.docx', '.csv', '.xlsx'];
    const maxSize = 5 * 1024 * 1024;

    Array.from(files).forEach(file => {
      let error = '';
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(extension)) error = `Invalid type. Only ${allowedExtensions.join(', ')}.`;
      else if (file.size > maxSize) error = 'File exceeds 5MB limit.';
      
      const classId = Number(this.uploadTargetClassId);
      this.filesToUpload.push({ file, status: error ? 'error' : 'pending', progress: 0, error, classId });
    });
    this.startUploads();
  }
  
  startUploads() {
    this.filesToUpload.forEach(uploadable => {
      if (uploadable.status === 'pending') {
        this.uploadFile(uploadable);
      }
    });
  }

  uploadFile(uploadable: UploadableFile) {
    uploadable.status = 'uploading';
    uploadable.subscription = this.apiService.uploadMaterial(uploadable.file, uploadable.classId).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          uploadable.progress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          uploadable.status = 'success';
          uploadable.subscription?.unsubscribe();
        }
      },
      error: (err) => {
        uploadable.status = 'error';
        uploadable.error = err.error?.message || 'Upload failed.';
        uploadable.subscription?.unsubscribe();
      },
      complete: () => {
        setTimeout(() => this.removeFileFromQueue(this.filesToUpload.indexOf(uploadable)), 2000);
      }
    });
  }

  removeFileFromQueue(index: number) {
    if (index > -1) {
      this.filesToUpload[index].subscription?.unsubscribe();
      this.filesToUpload.splice(index, 1);
    }
  }

  // --- Bulk & Single Item Actions ---
  toggleFileSelection(fileId: number, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) this.selectedFileIds.add(fileId);
    else this.selectedFileIds.delete(fileId);
    this.showBulkToolbar = this.selectedFileIds.size > 0;
  }
  
  // --- THIS IS THE FIX for NG5002 ---
  openDeleteModal(ids: number | Set<number>, name?: string) {
    const idsToDelete = (typeof ids === 'number') ? [ids] : [...ids];
    const message = name 
      ? `Are you sure you want to permanently delete <strong>"${name}"</strong>?`
      : `Are you sure you want to permanently delete <strong>${idsToDelete.length} material(s)</strong>?`;
    
    this.confirmModal = {
      isOpen: true,
      title: 'Delete Material(s)',
      message: `${message} This action cannot be undone.`,
      onConfirm: () => {
        this.materialService.deleteMaterials(idsToDelete).subscribe({
          next: () => {
            this.showNotificationBanner('success', `${idsToDelete.length} file(s) deleted successfully.`);
            this.clearSelection();
          },
          error: (err) => this.showNotificationBanner('error', err.error?.message || 'An error occurred during deletion.')
        });
        this.closeConfirmModal();
      }
    };
  }
  
  // --- THIS IS THE FIX for NG5002 ---
  openAssignModal(ids: number | Set<number>) {
    this.selectedFileIds = (typeof ids === 'number') ? new Set([ids]) : ids;
    this.isAssignModalOpen = true;
  }
  
  confirmAssignment() {
    const idsToAssign = [...this.selectedFileIds];
    const classId = this.assignTargetClassId === 'unassign' ? null : Number(this.assignTargetClassId);
    const className = this.getClassNameById(classId);

    this.materialService.assignMaterials(idsToAssign, classId).subscribe({
      next: () => {
        this.showNotificationBanner('success', `Files successfully assigned to "${className}".`);
        this.clearSelection();
      },
      error: (err) => this.showNotificationBanner('error', err.error?.message || 'An error occurred during assignment.')
    });
  }

  clearSelection() {
    this.selectedFileIds.clear();
    this.showBulkToolbar = false;
    this.isAssignModalOpen = false;
    this.assignTargetClassId = '';
    const checkboxes = document.querySelectorAll('.file-checkbox') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(cb => cb.checked = false);
  }

  closeConfirmModal = () => this.confirmModal.isOpen = false;
  
  // --- UI Helpers ---
  getFileTypeIcon(fileName: string): string {
    if (fileName.endsWith('.docx')) return 'fas fa-file-word';
    if (fileName.endsWith('.csv')) return 'fas fa-file-csv';
    if (fileName.endsWith('.xlsx')) return 'fas fa-file-excel';
    if (fileName.endsWith('.pdf')) return 'fas fa-file-pdf';
    return 'fas fa-file';
  }

  showNotificationBanner(type: 'success' | 'error', message: string) {
    if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
    this.notification = { type, message };
    this.notificationTimeout = setTimeout(() => this.notification = null, 5000);
  }
}

