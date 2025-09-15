import { Component, OnInit } from '@angular/core';
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
  classId: number | null;
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
export class UploadMaterialComponent implements OnInit {
  
  filesToUpload: UploadableFile[] = [];
  isDragging = false;
  uploadTargetClassId: string = ''; 
  
  // --- THIS IS THE FIX: The missing property is now declared ---
  selectedClassFilter: string = 'all';

  classes$: Observable<Classroom[]>;
  materials$: Observable<Material[]>;
  filteredMaterials$: Observable<Material[]>;
  
  private allClasses: Classroom[] = [];
  public filter = new BehaviorSubject<string>('all');

  selectedFileIds = new Set<number>();
  showBulkToolbar = false;
  isBulkAssignModalOpen = false;
  bulkAssignClassId: string = 'unassign';
  
  notification: Notification | null = null;
  private notificationTimeout: any;

  constructor(
    private apiService: ApiService, 
    private classService: ClassService,
    private materialService: MaterialService
  ) {
    this.classes$ = this.classService.classes$;
    this.materials$ = this.materialService.materials$;

    this.filteredMaterials$ = combineLatest([this.materials$, this.filter]).pipe(
      map(([materials, filterValue]: [Material[], string]) => {
        if (filterValue === 'all') return materials;
        if (filterValue === 'unassigned') return materials.filter(m => !m.classroom);
        return materials.filter(m => m.classroom?.id === Number(filterValue));
      })
    );
  }

  ngOnInit(): void {
    this.classes$.subscribe((classes: Classroom[]) => {
      this.allClasses = classes;
    });
  }

  onFilterChange(filterValue: string): void {
    this.filter.next(filterValue);
  }

  getClassNameById(classId: number): string {
    const foundClass = this.allClasses.find(c => c.id === classId);
    return foundClass ? foundClass.name : 'Unknown Class';
  }

  onDragOver(event: DragEvent) { event.preventDefault(); this.isDragging = true; }
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
      this.showNotificationBanner('error', 'Please select a class to upload files to first.');
      return;
    }
    const allowedExtensions = ['.docx', '.csv', '.xlsx'];
    const maxSize = 5 * 1024 * 1024;

    Array.from(files).forEach(file => {
      let error = '';
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(extension)) error = 'Invalid type. Only .docx, .csv, .xlsx.';
      else if (file.size > maxSize) error = 'File exceeds 5MB limit.';
      
      const classId = Number(this.uploadTargetClassId);
      this.filesToUpload.push({ file, status: error ? 'error' : 'pending', progress: 0, error, classId });
    });
    this.startUploads();
  }
  
  startUploads() {
    this.filesToUpload.forEach(uploadable => {
      if (uploadable.status === 'pending' && uploadable.classId) {
        this.uploadFile(uploadable);
      }
    });
  }

  uploadFile(uploadable: UploadableFile) {
    uploadable.status = 'uploading';
    uploadable.subscription = this.apiService.uploadMaterial(uploadable.file, uploadable.classId!).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          uploadable.progress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          uploadable.status = 'success';
          this.materialService.loadMaterials();
          this.showNotificationBanner('success', `"${uploadable.file.name}" uploaded successfully!`);
          uploadable.subscription?.unsubscribe();
        }
      },
      error: (err) => {
        uploadable.status = 'error';
        uploadable.error = err.error?.error || 'Upload failed.';
        uploadable.subscription?.unsubscribe();
      }
    });
  }

  removeFileFromQueue(index: number) {
    this.filesToUpload[index].subscription?.unsubscribe();
    this.filesToUpload.splice(index, 1);
  }

  toggleFileSelection(fileId: number | undefined, event: Event) {
    if (!fileId) return;
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) this.selectedFileIds.add(fileId);
    else this.selectedFileIds.delete(fileId);
    this.showBulkToolbar = this.selectedFileIds.size > 0;
  }

  handleBulkDelete() {
    if (confirm(`Are you sure you want to delete ${this.selectedFileIds.size} file(s)?`)) {
      const idsToDelete = [...this.selectedFileIds];
      this.materialService.deleteMaterials(idsToDelete).subscribe({
        next: () => {
          this.showNotificationBanner('success', `${idsToDelete.length} file(s) deleted successfully.`);
          this.clearSelection();
        },
        error: (err) => this.showNotificationBanner('error', 'An error occurred during deletion.')
      });
    }
  }

  handleBulkAssign() {
    const idsToAssign = [...this.selectedFileIds];
    const classId = this.bulkAssignClassId === 'unassign' ? null : Number(this.bulkAssignClassId);
    const className = classId ? this.getClassNameById(classId) : 'Unassigned';

    this.materialService.assignMaterials(idsToAssign, classId).subscribe({
      next: () => {
        this.showNotificationBanner('success', `Files successfully assigned to "${className}".`);
        this.clearSelection();
      },
      error: (err) => this.showNotificationBanner('error', 'An error occurred during assignment.')
    });
  }

  clearSelection() {
    this.selectedFileIds.clear();
    this.showBulkToolbar = false;
    this.closeBulkAssignModal();
    const checkboxes = document.querySelectorAll('.file-checkbox') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(cb => cb.checked = false);
  }
  
  openBulkAssignModal() { this.isBulkAssignModalOpen = true; }
  closeBulkAssignModal() { this.isBulkAssignModalOpen = false; }

  getFileTypeIcon(fileName: string): string {
    if (fileName.endsWith('.docx')) return 'fas fa-file-word';
    if (fileName.endsWith('.csv')) return 'fas fa-file-csv';
    if (fileName.endsWith('.xlsx')) return 'fas fa-file-excel';
    return 'fas fa-file';
  }

  showNotificationBanner(type: 'success' | 'error', message: string) {
    if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
    this.notification = { type, message };
    this.notificationTimeout = setTimeout(() => this.notification = null, 5000);
  }
}

