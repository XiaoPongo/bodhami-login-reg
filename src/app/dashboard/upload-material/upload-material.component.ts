import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpEventType, HttpEvent } from '@angular/common/http';
import { ApiService, Classroom, Material } from '../../services/api.service';
import { ClassService } from '../../services/class.service';
import { MaterialService } from '../../services/material.service';
import { RouterModule } from '@angular/router';

interface UploadableFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  subscription?: Subscription;
}

type NotificationType = 'success' | 'error';
type ModalAction = 'assign' | 'delete';

@Component({
  selector: 'app-upload-material',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './upload-material.component.html',
  styleUrls: ['./upload-material.component.css']
})
export class UploadMaterialComponent implements OnInit {
  
  filesToUpload: UploadableFile[] = [];
  isDragging = false;
  
  classes$: Observable<Classroom[]>;
  materials$: Observable<Material[]>;
  filteredMaterials$: Observable<Material[]>;
  isLoading$: Observable<boolean>;
  
  private allClasses: Classroom[] = [];
  public filter = new BehaviorSubject<string>('all');
  
  public selectedClassFilter: string = 'all';

  selectedFileIds = new Set<number>();
  showBulkToolbar = false;
  
  isModalOpen = false;
  modalAction: ModalAction = 'assign';
  modalTitle = '';
  modalMessage = '';
  modalActionClassId: string | null = null;
  filesForModal: number[] = [];
  
  notification: { type: NotificationType, message: string } | null = null;
  private notificationTimeout: any;

  fileDetailsModal = {
    isOpen: false,
    material: null as Material | null,
  };

  constructor(
    private apiService: ApiService, 
    private classService: ClassService,
    public materialService: MaterialService
  ) {
    this.classes$ = this.classService.classes$;
    this.materials$ = this.materialService.materials$;
    this.isLoading$ = this.materialService.isLoading$;

    this.filteredMaterials$ = combineLatest([this.materials$, this.filter]).pipe(
      map(([materials, filterValue]) => {
        if (filterValue === 'all') return materials;
        return materials.filter(m => m.classroom?.id === Number(filterValue));
      })
    );
  }

  ngOnInit(): void {
    this.classes$.subscribe(classes => this.allClasses = classes);
    this.materialService.loadMaterials();
  }

  handleRefresh(): void {
    this.showNotification('success', 'Refreshing materials...');
    this.materialService.loadMaterials();
  }

  onFilterChange(filterValue: string): void {
    this.filter.next(filterValue);
  }

  getClassNameById(classId: number | null): string {
    if (classId === null) return 'Unassigned';
    const foundClass = this.allClasses.find(c => c.id === classId);
    return foundClass ? foundClass.name : 'Unknown';
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
    const allowedExtensions = ['.pdf', '.docx', '.csv', '.xlsx'];
    const maxSize = 5 * 1024 * 1024;

    Array.from(files).forEach(file => {
      let error = '';
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(extension)) error = 'Invalid type. Allowed: .pdf, .docx, .csv, .xlsx';
      else if (file.size > maxSize) error = 'File exceeds 5MB limit.';
      
      this.filesToUpload.push({ file, status: error ? 'error' : 'pending', progress: 0, error });
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
    uploadable.subscription = this.apiService.uploadMaterial(uploadable.file, 1).subscribe({ // 👈 replace "1" with selected classroom if needed
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          uploadable.progress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          uploadable.status = 'success';
          this.showNotification('success', `"${uploadable.file.name}" uploaded!`);
          uploadable.subscription?.unsubscribe();

          // ✅ Auto-refresh materials after upload
          this.materialService.loadMaterials();
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

  toggleFileSelection(fileId: number, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) this.selectedFileIds.add(fileId);
    else this.selectedFileIds.delete(fileId);
    this.showBulkToolbar = this.selectedFileIds.size > 0;
  }

  openAssignModal(ids: number[] | Set<number>) {
    this.filesForModal = Array.isArray(ids) ? ids : [...ids];
    this.modalAction = 'assign';
    this.modalTitle = `Assign ${this.filesForModal.length} Material(s)`;
    this.modalActionClassId = this.allClasses[0]?.id.toString() || null;
    this.isModalOpen = true;
  }

  openDeleteModal(ids: number[] | Set<number>) {
    this.filesForModal = Array.isArray(ids) ? ids : [...ids];
    this.modalAction = 'delete';
    this.modalTitle = `Delete ${this.filesForModal.length} Material(s)`;
    this.modalMessage = `Are you sure you want to permanently delete ${this.filesForModal.length} material(s)? This action cannot be undone.`;
    this.isModalOpen = true;
  }

  confirmModalAction() {
    if (this.modalAction === 'assign') {
      const classId = this.modalActionClassId === 'unassign' ? null : Number(this.modalActionClassId);
      this.materialService.assignMaterials(this.filesForModal, classId).subscribe({
        next: () => {
          this.showNotification('success', 'Materials assigned successfully.');
          this.clearSelection();
        },
        error: () => this.showNotification('error', 'Failed to assign materials.')
      });
    } else if (this.modalAction === 'delete') {
      this.materialService.deleteMaterials(this.filesForModal).subscribe({
        next: () => {
          this.showNotification('success', 'Materials deleted successfully.');
          this.clearSelection();
        },
        error: () => this.showNotification('error', 'Failed to delete materials.')
      });
    }
  }

  openFileDetailsModal(material: Material) {
    this.fileDetailsModal = {
      isOpen: true,
      material: material,
    };
  }

  closeFileDetailsModal() {
    this.fileDetailsModal.isOpen = false;
  }

  clearSelection() {
    this.selectedFileIds.clear();
    this.showBulkToolbar = false;
    this.closeModal();
    const checkboxes = document.querySelectorAll('.file-checkbox') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(cb => cb.checked = false);
  }

  closeModal() { this.isModalOpen = false; }
  
  getFileTypeIcon(fileName: string): string {
    if (fileName.endsWith('.pdf')) return 'fas fa-file-pdf';
    if (fileName.endsWith('.docx')) return 'fas fa-file-word';
    if (fileName.endsWith('.csv')) return 'fas fa-file-csv';
    if (fileName.endsWith('.xlsx')) return 'fas fa-file-excel';
    return 'fas fa-file';
  }
  
  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  showNotification(type: NotificationType, message: string) {
    if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
    this.notification = { type, message };
    this.notificationTimeout = setTimeout(() => this.notification = null, 5000);
  }
  
  async downloadFile(material: Material) {
    try {
      const response = await this.materialService.getDownloadUrl(material.id);
      window.open(response.url, '_blank');
    } catch (error) {
      this.showNotification('error', 'Could not get download link.');
    }
  }
}
