import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService, Classroom } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ClassService {
  private readonly _classes = new BehaviorSubject<Classroom[]>([]);
  public readonly classes$: Observable<Classroom[]> = this._classes.asObservable();
  
  private readonly _selectedClass = new BehaviorSubject<Classroom | null>(null);
  public readonly selectedClass$: Observable<Classroom | null> = this._selectedClass.asObservable();

  constructor(private apiService: ApiService) {
    this.loadClasses();
  }

  loadClasses(): void {
    this.apiService.getClassrooms().subscribe({
      next: (classes: Classroom[]) => this._classes.next(classes),
      error: (err: any) => console.error("Failed to load classrooms", err)
    });
  }

  selectClass(id: number | null): void {
    if (id === null || id === this._selectedClass.value?.id) {
        if(id === null) this._selectedClass.next(null);
        return;
    }
    
    // ** FIX: Set to null before fetching to prevent showing stale data and fix glitch **
    this._selectedClass.next(null); 

    this.apiService.getClassroomById(id).subscribe({
      next: (classroom: Classroom) => this._selectedClass.next(classroom),
      error: (err: any) => {
        console.error(`Failed to load class with id ${id}`, err);
        this._selectedClass.next(null); // Ensure it's cleared on error
      }
    });
  }

  createClass(name: string, description: string): Observable<Classroom> {
    return this.apiService.createClassroom({ name, description }).pipe(
      tap(() => this.loadClasses())
    );
  }
  
  updateClass(id: number, name: string, description: string): Observable<Classroom> {
    return this.apiService.updateClassroom(id, { name, description }).pipe(
      tap((updatedClass) => {
        this.loadClasses(); // Refresh the list in case name changed
        this._selectedClass.next(updatedClass); // Update the selected class view immediately
      })
    );
  }

  deleteClass(classId: number): Observable<any> {
    if (!classId) return throwError(() => new Error('Invalid Class ID'));
    return this.apiService.deleteClassroom(classId).pipe(
      tap(() => {
        this.loadClasses();
        if (this._selectedClass.value?.id === classId) {
          this._selectedClass.next(null);
        }
      })
    );
  }

  // --- NEW METHODS for managing class content ---

  removeStudent(classId: number, studentId: string): Observable<any> {
    return this.apiService.removeStudentFromClass(classId, studentId).pipe(
      tap(() => this.selectClass(classId)) // Refresh class data
    );
  }

  unassignMaterial(classId: number, materialId: number): Observable<any> {
    return this.apiService.unassignMaterialFromClass(classId, materialId).pipe(
      tap(() => this.selectClass(classId)) // Refresh class data
    );
  }

  unassignActivity(classId: number, activityId: number): Observable<any> {
    return this.apiService.unassignActivityFromClass(classId, activityId).pipe(
      tap(() => this.selectClass(classId)) // Refresh class data
    );
  }
}
