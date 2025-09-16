import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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
      return;
    }
    if (id === this._selectedClass.value?.id) {
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
        this.loadClasses();
        this._selectedClass.next(updatedClass);
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

  removeStudent(classId: number, studentId: string): Observable<any> {
    return this.apiService.removeStudentFromClass(classId, studentId).pipe(
      tap(() => this.refreshClassData(classId))
    );
  }

  unassignMaterial(classId: number, materialId: number): Observable<any> {
    return this.materialService.assignMaterials([materialId], null).pipe(
      tap(() => this.refreshClassData(classId))
    );
  }

  unassignActivity(classId: number, activityId: number): Observable<any> {
    return this.apiService.unassignActivityFromClass(classId, activityId).pipe(
      tap(() => this.refreshClassData(classId))
    );
  }

  private refreshClassData(classId: number): void {
    this.loadClasses();
    this.selectClass(classId);
  }
}