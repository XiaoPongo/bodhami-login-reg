import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService, Classroom, Student, Activity, Material } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ClassService {
  private readonly _classes = new BehaviorSubject<Classroom[]>([]);
  public readonly classes$: Observable<Classroom[]> = this._classes.asObservable();
  
  private readonly _selectedClass = new BehaviorSubject<Classroom | null>(null);
  public readonly selectedClass$: Observable<Classroom | null> = this._selectedClass.asObservable();

  private readonly _isLoading = new BehaviorSubject<boolean>(false);
  public readonly isLoading$: Observable<boolean> = this._isLoading.asObservable();

  constructor(private apiService: ApiService) {
    this.loadClasses();
  }
  
  loadClasses(): void {
    this._isLoading.next(true);
    this.apiService.getClassrooms().subscribe({
      next: (classes) => {
        this._classes.next(classes);
        // If a class was selected, refresh its data too
        const selectedId = this.getSelectedClassId();
        if (selectedId) {
          const refreshedClass = classes.find(c => c.id === selectedId);
          this._selectedClass.next(refreshedClass || null);
        }
        this._isLoading.next(false);
      },
      error: (err) => {
        console.error("Failed to load classrooms", err);
        this._isLoading.next(false);
      }
    });
  }

  selectClass(id: number | null): void {
    if (id === null) {
      this._selectedClass.next(null);
      return;
    }
    const foundClass = this._classes.getValue().find(c => c.id === id);
    this._selectedClass.next(foundClass || null);
  }

  // --- THIS IS THE FIX: The missing method is now implemented ---
  public getSelectedClassId(): number | null {
    // .getValue() synchronously returns the current value from the BehaviorSubject
    return this._selectedClass.getValue()?.id ?? null;
  }

  createClass(name: string, description: string): Observable<Classroom> {
    return this.apiService.createClassroom({ name, description }).pipe(
      tap(() => this.loadClasses()) // Refresh list after creating
    );
  }
  
  updateClass(id: number, name: string, description: string): Observable<Classroom> {
    return this.apiService.updateClassroom(id, { name, description }).pipe(
      tap(() => this.loadClasses()) // Refresh list after updating
    );
  }

  deleteClass(classId: number): Observable<any> {
    return this.apiService.deleteClassroom(classId).pipe(
      tap(() => {
        if (this.getSelectedClassId() === classId) {
          this.selectClass(null);
        }
        this.loadClasses(); // Refresh list after deleting
      })
    );
  }

  removeStudent(classId: number, studentId: string): Observable<any> {
    return this.apiService.removeStudentFromClass(classId, studentId).pipe(
      tap(() => this.loadClasses()) // Refresh to update student count
    );
  }

  unassignActivity(classId: number, activityId: number): Observable<any> {
    return this.apiService.unassignActivityFromClass(classId, activityId).pipe(
      tap(() => this.loadClasses()) // Refresh to update activity count
    );
  }
}

