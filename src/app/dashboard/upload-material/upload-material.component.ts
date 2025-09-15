import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpEventType, HttpEvent } from '@angular/common/http';
import { ApiService, Classroom, Material } from '../../services/api.service';
import { ClassService } from '../../services/class.service';
// NOTE: We are NOT importing MaterialService as it does not exist.

interface UploadableFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  subscription?: Subscription;
  classId: number | null; // Class to upload to
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
  uploadTargetClassId: string = 'null'; // Bound to the dropdown

  // --- MOCKED DATA LAYER for File Management ---
  // This data is used to populate the grid until the API supports fetching materials.
  allMaterials: Material[] = [
    { id: 1, displayName: 'Introduction-to-Physics.docx', s3Url: '#', fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', mentorId: 'mentor1', uploadedAt: new Date('2025-09-10'), classroom: { id: 2 } as Classroom },
    { id: 2, displayName: 'Chemistry-Lab-Results.xlsx', s3Url: '#', fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', mentorId: 'mentor1', uploadedAt: new Date('2025-09-11'), classroom: { id: 4 } as Classroom },
  ];
  filteredMaterials: Material[] = [];
  classes$: Observable<Classroom[]>;
  private allClasses: Classroom[] = [];
  
  // FIX: Make filter public for template access
  public filter = new BehaviorSubject<string>('all');

  selectedFileIds = new Set<number>();
  showBulkToolbar = false;
  isBulkAssignModalOpen = false;
  bulkAssignClassId: string = 'unassign';
  
  // --- NEW: Properties for the notification system ---
  notification: Notification | null = null;
  private notificationTimeout: any;

  constructor(
    private apiService: ApiService, 
    private classService: ClassService
  ) {
    this.classes$ = this.classService.classes$;
  }

  ngOnInit(): void {
    this.filterFiles(); // Initial filter for mock data
    this.classes$.subscribe(classes => {
      this.allClasses = classes;
    });
  }

  // Helper function for the template
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
    const maxSize = 5 * 1024 * 1024;

    Array.from(files).forEach(file => {
      let error = '';
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(extension)) error = 'Invalid type. Only .docx, .csv, .xlsx.';
      else if (file.size > maxSize) error = 'File exceeds 5MB limit.';
      
      const classId = this.uploadTargetClassId === 'null' ? null : Number(this.uploadTargetClassId);
      if (!classId) {
        error = 'Please select a class to upload to first.';
      }

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

  // THIS IS THE REAL UPLOAD LOGIC, USING THE EXISTING API
  uploadFile(uploadable: UploadableFile) {
    uploadable.status = 'uploading';
    
    // Create a dummy CSV blob on the fly, as required by the existing API
    const csvContent = `Title,${uploadable.file.name}\nXP,0\nNote,Material Upload`;
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Use the existing `uploadFile` method, treating this as a 'mission' for the API
    uploadable.subscription = this.apiService.uploadFile(csvBlob, 'mission', uploadable.file.name + '.csv', uploadable.classId!)
      .subscribe({
        next: (response) => {
          uploadable.status = 'success';
          this.showNotificationBanner('success', `File "${uploadable.file.name}" uploaded successfully!`);
          uploadable.subscription?.unsubscribe();
          // In a real app with GET /materials, we would refresh the list here.
        },
        error: (err) => {
          uploadable.status = 'error';
          uploadable.error = err.error?.error || 'Upload failed on the server.';
          console.error('Upload failed:', err);
          uploadable.subscription?.unsubscribe();
        }
    });
  }

  removeFileFromQueue(index: number) {
    this.filesToUpload[index].subscription?.unsubscribe();
    this.filesToUpload.splice(index, 1);
  }

  onFilterChange(filterValue: string): void {
    this.filter.next(filterValue);
    this.filterFiles();
  }

  filterFiles() {
    const filterValue = this.filter.getValue();
    if (filterValue === 'all') this.filteredMaterials = [...this.allMaterials];
    else if (filterValue === 'unassigned') this.filteredMaterials = this.allMaterials.filter(m => !m.classroom);
    else this.filteredMaterials = this.allMaterials.filter(m => m.classroom?.id === Number(filterValue));
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
  
  // --- NEW: Method to show and hide the notification banner ---
  showNotificationBanner(type: 'success' | 'error', message: string) {
    if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
    this.notification = { type, message };
    this.notificationTimeout = setTimeout(() => this.notification = null, 5000);
  }
}

