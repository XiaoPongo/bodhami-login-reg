import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, map } from 'rxjs/operators';
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

  constructor(
    private apiService: ApiService,
    private materialService: MaterialService
  ) {
    this.loadClasses();
  }

  loadClasses(): void {
    this._isLoading.next(true);
    this.apiService.getClassrooms().subscribe({
      next: (classes: Classroom[]) => {
        this._classes.next(classes);
        this._isLoading.next(false);
      },
      error: (err: any) => {
        console.error("Failed to load classrooms", err);
        this._isLoading.next(false);
      }
    });
  }

  /**
   * Selects a class from the already loaded list.
   * This avoids making a new API call to a student-only endpoint.
   */
  selectClass(id: number | null): void {
    if (id === null) {
      this._selectedClass.next(null);
      return;
    }

    const currentClasses = this._classes.getValue();
    const foundClass = currentClasses.find(c => c.id === id);
    
    // The class details are already available from the initial load.
    // We set it directly instead of fetching again.
    this._selectedClass.next(foundClass || null);
  }

  createClass(name: string, description: string): Observable<Classroom> {
    return this.apiService.createClassroom({ name, description }).pipe(
      tap((newClassroom) => {
        // Optimistically add the new class to the list for an instant UI update.
        const currentClasses = this._classes.getValue();
        this._classes.next([...currentClasses, newClassroom].sort((a, b) => a.name.localeCompare(b.name)));
      })
    );
  }
  
  updateClass(id: number, name: string, description: string): Observable<Classroom> {
    return this.apiService.updateClassroom(id, { name, description }).pipe(
      tap((updatedClass) => {
        this._selectedClass.next(updatedClass);
        // Refresh the main list to reflect the changes everywhere.
        this.loadClasses();
      })
    );
  }

  deleteClass(classId: number): Observable<any> {
    return this.apiService.deleteClassroom(classId).pipe(
      tap(() => {
        // Optimistically remove the class from the list.
        const currentClasses = this._classes.getValue().filter(c => c.id !== classId);
        this._classes.next(currentClasses);

        if (this._selectedClass.value?.id === classId) {
          this._selectedClass.next(null);
        }
      })
    );
  }

  // The methods below will now work correctly because `selectClass` provides the right data.
  removeStudent(classId: number, studentId: string): Observable<any> {
    return this.apiService.removeStudentFromClass(classId, studentId).pipe(
      tap(() => this.refreshSelectedClassData(classId))
    );
  }

  unassignMaterial(classId: number, materialId: number): Observable<any> {
    return this.materialService.assignMaterials([materialId], null).pipe(
      tap(() => this.refreshSelectedClassData(classId))
    );
  }

  unassignActivity(classId: number, activityId: number): Observable<any> {
    return this.apiService.unassignActivityFromClass(classId, activityId).pipe(
      tap(() => this.refreshSelectedClassData(classId))
    );
  }

  /**
   * Refreshes both the main class list and the selected class details
   * to ensure the UI is perfectly in sync after a change.
   */
  private refreshSelectedClassData(classId: number): void {
    this.apiService.getClassrooms().subscribe(allClasses => {
        this._classes.next(allClasses);
        const refreshedClass = allClasses.find(c => c.id === classId);
        this._selectedClass.next(refreshedClass || null);
    });
  }
}

