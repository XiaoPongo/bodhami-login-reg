import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
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
    this.apiService.getClassrooms().subscribe({
      next: (classes: Classroom[]) => this._classes.next(classes),
      error: (err: any) => console.error("Failed to load classrooms", err)
    });
  }

  selectClass(id: number | null): void {
    if (id === null) {
      this._selectedClass.next(null);
      this._isLoading.next(false);
      return;
    }

    if (id === this._selectedClass.value?.id && !this._isLoading.value) {
        return;
    }
    
    this._isLoading.next(true);
    this._selectedClass.next(null); 

    this.apiService.getClassroomById(id).subscribe({
      next: (classroom: Classroom) => {
        this._selectedClass.next(classroom);
        this._isLoading.next(false);
      },
      error: (err: any) => {
        console.error(`Failed to load class with id ${id}`, err);
        this._selectedClass.next(null); 
        this._isLoading.next(false);
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
        this._selectedClass.next(updatedClass); // Immediately update the view
        this.loadClasses(); // Refresh the list in the background
      })
    );
  }

  deleteClass(classId: number): Observable<any> {
    return this.apiService.deleteClassroom(classId).pipe(
      tap(() => {
        this.loadClasses();
        if (this._selectedClass.value?.id === classId) {
          this._selectedClass.next(null);
        }
      })
    );
  }

  removeStudent(classId: number, studentId: string): Observable<any> {
    return this.apiService.removeStudentFromClass(classId, studentId).pipe(
      tap(() => this.refreshSelectedClassData(classId))
    );
  }

  unassignMaterial(classId: number, materialId: number): Observable<any> {
    // Unassigning is done by assigning the material to a `null` classroom
    return this.materialService.assignMaterials([materialId], null).pipe(
      tap(() => this.refreshSelectedClassData(classId))
    );
  }

  unassignActivity(classId: number, activityId: number): Observable<any> {
    return this.apiService.unassignActivityFromClass(classId, activityId).pipe(
      tap(() => this.refreshSelectedClassData(classId))
    );
  }

  private refreshSelectedClassData(classId: number): void {
    this.loadClasses(); // Refresh counts on the left panel
    // Re-fetch the selected class's data to show the updated content
    // This is better than just selecting, as it forces a fresh API call
    this.apiService.getClassroomById(classId).subscribe({
        next: (classroom) => this._selectedClass.next(classroom),
        error: (err) => console.error(`Failed to refresh class data for id ${classId}`, err),
    });
  }
}

