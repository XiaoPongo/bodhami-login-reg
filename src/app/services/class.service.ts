import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { ApiService, Classroom } from './api.service';
import { MaterialService } from './material.service';

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

  private _selectedClassId: number | null = null;

  constructor(
    private apiService: ApiService,
    private materialService: MaterialService // Ensure MaterialService is injected if used
  ) {
    this.loadClasses();
  }

  loadClasses(): void {
    this._isLoading.next(true);
    this.apiService.getClassrooms().pipe(
      finalize(() => this._isLoading.next(false))
    ).subscribe({
      next: (classes: Classroom[]) => {
        this._classes.next(classes);
        // After reloading, re-select the class to get fresh data
        if (this._selectedClassId) {
          const refreshedClass = classes.find(c => c.id === this._selectedClassId);
          this._selectedClass.next(refreshedClass || null);
        }
      },
      error: (err: any) => {
        console.error("Failed to load classrooms", err);
      }
    });
  }

  selectClass(id: number | null): void {
    this._selectedClassId = id; // Store the selected ID
    if (id === null) {
      this._selectedClass.next(null);
      return;
    }
    const foundClass = this._classes.getValue().find(c => c.id === id);
    this._selectedClass.next(foundClass || null);
  }

  createClass(name: string, description: string): Observable<Classroom> {
    return this.apiService.createClassroom({ name, description }).pipe(
      tap(() => this.loadClasses()) // Auto-refresh on success
    );
  }
  
  updateClass(id: number, name: string, description: string): Observable<Classroom> {
    return this.apiService.updateClassroom(id, { name, description }).pipe(
      tap(() => this.loadClasses()) // Auto-refresh on success
    );
  }

  deleteClass(classId: number): Observable<any> {
    return this.apiService.deleteClassroom(classId).pipe(
      tap(() => {
        this._selectedClassId = null; // Clear selection if deleted
        this.loadClasses(); // Auto-refresh on success
      })
    );
  }

  removeStudent(classId: number, studentId: string): Observable<any> {
    return this.apiService.removeStudentFromClass(classId, studentId).pipe(
      tap(() => this.loadClasses()) // Auto-refresh on success
    );
  }

  unassignMaterial(classId: number, materialId: number): Observable<any> {
    // Assuming assigning to `null` unassigns it
    return this.materialService.assignMaterials([materialId], null).pipe(
      tap(() => this.loadClasses()) // Auto-refresh on success
    );
  }

  unassignActivity(classId: number, activityId: number): Observable<any> {
    return this.apiService.unassignActivityFromClass(classId, activityId).pipe(
      tap(() => this.loadClasses()) // Auto-refresh on success
    );
  }
}

