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
      tap((newClassroom) => {
        const currentClasses = this._classes.getValue();
        this._classes.next([...currentClasses, newClassroom].sort((a, b) => a.name.localeCompare(b.name)));
      })
    );
  }
  
  updateClass(id: number, name: string, description: string): Observable<Classroom> {
    return this.apiService.updateClassroom(id, { name, description }).pipe(
      tap((updatedClass) => {
        this._selectedClass.next(updatedClass);
        this.loadClasses(); // Refresh list to reflect name/desc changes
      })
    );
  }

  deleteClass(classId: number): Observable<any> {
    return this.apiService.deleteClassroom(classId).pipe(
      tap(() => {
        const currentClasses = this._classes.getValue().filter(c => c.id !== classId);
        this._classes.next(currentClasses);

        if (this._selectedClass.value?.id === classId) {
          this._selectedClass.next(null);
        }
      })
    );
  }

  removeStudent(classId: number, studentId: string): Observable<any> {
    return this.apiService.removeStudentFromClass(classId, studentId).pipe(
      tap(() => {
        const currentClass = this._selectedClass.getValue();
        if (currentClass && currentClass.id === classId) {
          const updatedStudents = currentClass.students.filter(s => s.id !== studentId);
          this._selectedClass.next({ ...currentClass, students: updatedStudents });
        }
        this.loadClasses(); // Refresh main list for student counts
      })
    );
  }

  unassignMaterial(classId: number, materialId: number): Observable<any> {
    return this.materialService.assignMaterials([materialId], null).pipe(
      tap(() => {
         const currentClass = this._selectedClass.getValue();
        if (currentClass && currentClass.id === classId) {
          const updatedMaterials = currentClass.materials.filter(m => m.id !== materialId);
          this._selectedClass.next({ ...currentClass, materials: updatedMaterials });
        }
        this.loadClasses(); // Refresh main list for content counts
      })
    );
  }

  unassignActivity(classId: number, activityId: number): Observable<any> {
    return this.apiService.unassignActivityFromClass(classId, activityId).pipe(
      tap(() => {
        const currentClass = this._selectedClass.getValue();
        if (currentClass && currentClass.id === classId) {
          const updatedActivities = currentClass.activities.filter(a => a.id !== activityId);
          this._selectedClass.next({ ...currentClass, activities: updatedActivities });
        }
        this.loadClasses(); // Refresh main list for content counts
      })
    );
  }
}

