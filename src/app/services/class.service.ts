import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, throwError, of } from 'rxjs';
import { ApiService, Classroom, Student } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ClassService {
  // Holds the list of all classes for the mentor
  private readonly _classes = new BehaviorSubject<Classroom[]>([]);
  public readonly classes$: Observable<Classroom[]> = this._classes.asObservable();

  // --- NEW: Holds the detailed view of the currently selected class ---
  private readonly _selectedClass = new BehaviorSubject<Classroom | null>(null);
  public readonly selectedClass$: Observable<Classroom | null> = this._selectedClass.asObservable();

  constructor(private apiService: ApiService) {
    this.loadClasses();
  }

  // --- Public Methods for Components ---

  loadClasses(): void {
    this.apiService.getClassrooms().subscribe({
      next: (classes) => this._classes.next(classes),
      error: (err) => console.error("Failed to load classrooms", err)
    });
  }

  // --- NEW: Fetches a single class by ID and sets it as the selected one ---
  selectClass(id: number | null): void {
    if (id === null) {
      this._selectedClass.next(null);
      return;
    }
    this.apiService.getClassroomById(id).subscribe({
      next: (classroom) => this._selectedClass.next(classroom),
      error: (err) => console.error(`Failed to load class with id ${id}`, err)
    });
  }

  createClass(name: string, description: string): Observable<Classroom> {
    return this.apiService.createClassroom({ name, description }).pipe(
      tap(() => this.loadClasses())
    );
  }

  deleteClass(classId: number): Observable<any> {
    if (!classId) return throwError(() => new Error('Invalid Class ID'));
    return this.apiService.deleteClassroom(classId).pipe(
      tap(() => {
        this.loadClasses();
        // If the deleted class was the selected one, clear the selection
        if (this._selectedClass.value?.id === classId) {
          this._selectedClass.next(null);
        }
      })
    );
  }
  
  // Mock student management methods for now
  addStudentToClass(classId: number, studentEmail: string): Observable<any> {
    console.log(`SERVICE: Adding student ${studentEmail} to class ${classId}`);
    return of({ success: true }).pipe(tap(() => this.selectClass(classId))); // Refresh after adding
  }

  removeStudentFromClass(classId: number, studentId: string): Observable<any> {
    console.log(`SERVICE: Removing student ${studentId} from class ${classId}`);
    return of({ success: true }).pipe(tap(() => this.selectClass(classId))); // Refresh after removing
  }
}

