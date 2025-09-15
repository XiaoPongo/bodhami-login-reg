import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription, of } from 'rxjs';
import { HttpEventType, HttpEvent } from '@angular/common/http';
import { ApiService, Classroom, Material } from '../../services/api.service';
import { ClassService } from '../../services/class.service';

// Interface for tracking file uploads in the UI
interface UploadableFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  subscription?: Subscription;
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

  // --- MOCKED DATA LAYER for File Management ---
  // This data is used to populate the grid. It will be replaced by a real API call later.
  allMaterials: Material[] = [
    { id: 1, displayName: 'Introduction-to-Physics.docx', s3Url: '#', fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', mentorId: 'mentor1', uploadedAt: new Date('2025-09-10'), classroom: { id: 2 } as Classroom },
    { id: 2, displayName: 'Chemistry-Lab-Results.xlsx', s3Url: '#', fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', mentorId: 'mentor1', uploadedAt: new Date('2025-09-11'), classroom: { id: 4 } as Classroom },
    { id: 3, displayName: 'Important-Student-Data.csv', s3Url: '#', fileType: 'text/csv', mentorId: 'mentor1', uploadedAt: new Date('2025-09-12'), classroom: null },
    { id: 4, displayName: 'Archived-Notes.docx', s3Url: '#', fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', mentorId: 'mentor1', uploadedAt: new Date('2025-09-09'), classroom: null },
  ];
  filteredMaterials: Material[] = [];
  classes$: Observable<Classroom[]>;
  selectedClassFilter: string = 'all';

  // Bulk Actions
  selectedFileIds = new Set<number>();
  showBulkToolbar = false;
  isBulkAssignModalOpen = false;
  bulkAssignClassId: string = 'unassign'; // Default to unassign

  constructor(
    private apiService: ApiService, 
    private classService: ClassService
  ) {
    this.classes$ = this.classService.classes$;
  }

  ngOnInit(): void {
    // In a real app, this line would fetch the initial data:
    // this.apiService.getMaterials().subscribe(m => { this.allMaterials = m; this.filterFiles(); });
    this.filterFiles(); // Initial filter for mock data
  }

  // --- Drag and Drop Handlers ---
  onDragOver(event: DragEvent) { event.preventDefault(); this.isDragging = true; }
  onDragLeave(event: DragEvent) { event.preventDefault(); this.isDragging = false; }
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files) this.handleFiles(event.dataTransfer.files);
  }

  // --- File Selection & Validation ---
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
      input.value = '';
    }
  }

  handleFiles(files: FileList) {
    const allowedExtensions = ['.docx', '.csv', '.xlsx'];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    Array.from(files).forEach(file => {
      let error = '';
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(extension)) error = 'Invalid type. Only .docx, .csv, .xlsx.';
      else if (file.size > maxSize) error = 'File exceeds 5MB limit.';

      this.filesToUpload.push({ file, status: error ? 'error' : 'pending', progress: 0, error });
    });
    this.startUploads();
  }
  
  // --- REAL UPLOAD PROCESS ---
  startUploads() {
    this.filesToUpload.forEach(uploadable => {
      if (uploadable.status === 'pending') this.uploadFile(uploadable);
    });
  }

  uploadFile(uploadable: UploadableFile) {
    uploadable.status = 'uploading';
    uploadable.subscription = this.apiService.uploadMaterial(uploadable.file).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          uploadable.progress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          uploadable.status = 'success';
          // In a real app, you would reload the materials list from the API here.
          // For now, add it to our mock list.
          const newMaterial: Material = {
            id: Math.random() * 1000,
            displayName: uploadable.file.name,
            s3Url: event.body.url, // Assuming API returns URL in body
            fileType: uploadable.file.type,
            mentorId: 'mentor1',
            uploadedAt: new Date(),
            classroom: null
          };
          this.allMaterials.unshift(newMaterial);
          this.filterFiles();
          uploadable.subscription?.unsubscribe();
        }
      },
      error: (err) => {
        uploadable.status = 'error';
        uploadable.error = err.error?.error || 'Upload failed.';
        console.error('Upload failed:', err);
        uploadable.subscription?.unsubscribe();
      }
    });
  }

  removeFileFromQueue(index: number) {
    this.filesToUpload[index].subscription?.unsubscribe();
    this.filesToUpload.splice(index, 1);
  }

  // --- File Management & Filtering ---
  filterFiles() {
    if (this.selectedClassFilter === 'all') {
      this.filteredMaterials = [...this.allMaterials];
    } else if (this.selectedClassFilter === 'unassigned') {
      this.filteredMaterials = this.allMaterials.filter(m => !m.classroom);
    } else {
      const classId = Number(this.selectedClassFilter);
      this.filteredMaterials = this.allMaterials.filter(m => m.classroom?.id === classId);
    }
  }

  // --- Bulk Actions ---
  toggleFileSelection(fileId: number, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) this.selectedFileIds.add(fileId);
    else this.selectedFileIds.delete(fileId);
    this.showBulkToolbar = this.selectedFileIds.size > 0;
  }

  handleBulkDelete() {
    if (confirm(`Are you sure you want to delete ${this.selectedFileIds.size} file(s)? This is a mock action.`)) {
      this.allMaterials = this.allMaterials.filter(m => !this.selectedFileIds.has(m.id));
      this.selectedFileIds.clear();
      this.showBulkToolbar = false;
      this.filterFiles();
      alert('Mock Delete: Files removed from view.');
    }
  }

  handleBulkAssign() {
    const classId = this.bulkAssignClassId === 'unassign' ? null : Number(this.bulkAssignClassId);
    const className = this.bulkAssignClassId === 'unassign' ? 'Unassigned' : document.querySelector(`option[value="${this.bulkAssignClassId}"]`)?.textContent;
    
    this.allMaterials.forEach(m => {
      if (this.selectedFileIds.has(m.id)) {
        m.classroom = classId ? { id: classId } as Classroom : null;
      }
    });
    
    this.selectedFileIds.clear();
    this.showBulkToolbar = false;
    this.closeBulkAssignModal();
    this.filterFiles();
    alert(`Mock Assign: Files assigned to ${className}.`);
  }
  
  openBulkAssignModal() { this.isBulkAssignModalOpen = true; }
  closeBulkAssignModal() { this.isBulkAssignModalOpen = false; }

  getFileTypeIcon(fileType: string): string {
    if (fileType.includes('wordprocessingml')) return 'fas fa-file-word';
    if (fileType.includes('csv')) return 'fas fa-file-csv';
    if (fileType.includes('spreadsheetml')) return 'fas fa-file-excel';
    return 'fas fa-file';
  }
}

