import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ApiService, Classroom, Material } from '../../services/api.service';
import { ClassService } from '../../services/class.service';
import { HttpEventType, HttpEvent } from '@angular/common/http';

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
  allMaterials: Material[] = [
    { id: 1, displayName: 'Introduction-to-Physics.docx', s3Url: '#', fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', mentorId: 'mentor1', uploadedAt: new Date('2025-09-10'), classroom: { id: 2 } as Classroom },
    { id: 2, displayName: 'Chemistry-Lab-Results.xlsx', s3Url: '#', fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', mentorId: 'mentor1', uploadedAt: new Date('2025-09-11'), classroom: { id: 4 } as Classroom },
  ];
  filteredMaterials: Material[] = [];
  classes$: Observable<Classroom[]>;
  private allClasses: Classroom[] = []; // <-- NEW: To store the class list for easy lookup
  selectedClassFilter: string = 'all';

  selectedFileIds = new Set<number>();
  showBulkToolbar = false;
  isBulkAssignModalOpen = false;
  bulkAssignClassId: string = 'unassign';

  constructor(
    private apiService: ApiService, 
    private classService: ClassService
  ) {
    this.classes$ = this.classService.classes$;
  }

  ngOnInit(): void {
    this.filterFiles(); // Initial filter for mock data

    // --- NEW: Subscribe to the class list to have it available for the helper function ---
    this.classes$.subscribe(classes => {
      this.allClasses = classes;
    });
  }

  // --- NEW: Helper function for the template ---
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
  
  startUploads() {
    this.filesToUpload.forEach(uploadable => {
      if (uploadable.status === 'pending') {
        this.uploadFile(uploadable);
      }
    });
  }

  uploadFile(uploadable: UploadableFile) {
    uploadable.status = 'uploading';
    // MOCK UPLOAD
    const interval = setInterval(() => {
      uploadable.progress += 20;
      if (uploadable.progress >= 100) {
        clearInterval(interval);
        uploadable.status = 'success';
      }
    }, 250);
  }

  removeFileFromQueue(index: number) {
    this.filesToUpload.splice(index, 1);
  }

  filterFiles() {
    if (this.selectedClassFilter === 'all') this.filteredMaterials = [...this.allMaterials];
    else if (this.selectedClassFilter === 'unassigned') this.filteredMaterials = this.allMaterials.filter(m => !m.classroom);
    else this.filteredMaterials = this.allMaterials.filter(m => m.classroom?.id === Number(this.selectedClassFilter));
  }

  toggleFileSelection(fileId: number, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) this.selectedFileIds.add(fileId);
    else this.selectedFileIds.delete(fileId);
    this.showBulkToolbar = this.selectedFileIds.size > 0;
  }

  handleBulkDelete() {
    alert('Mock Action: Bulk delete functionality requires API changes.');
  }

  handleBulkAssign() {
    alert('Mock Action: Bulk assign functionality requires API changes.');
    this.closeBulkAssignModal();
  }
  
  openBulkAssignModal() { this.isBulkAssignModalOpen = true; }
  closeBulkAssignModal() { this.isBulkAssignModalOpen = false; }

  getFileTypeIcon(fileName: string): string {
    if (fileName.endsWith('.docx')) return 'fas fa-file-word';
    if (fileName.endsWith('.csv')) return 'fas fa-file-csv';
    if (fileName.endsWith('.xlsx')) return 'fas fa-file-excel';
    return 'fas fa-file';
  }
}

