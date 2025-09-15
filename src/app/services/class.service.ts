import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, throwError, of } from 'rxjs';
import { ApiService, Classroom } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ClassService {
  private readonly _classes = new BehaviorSubject<Classroom[]>([]);
  public readonly classes$: Observable<Classroom[]> = this._classes.asObservable();
  
  // --- ADDED MISSING PROPERTIES ---
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

  // --- ADDED MISSING METHOD ---
  selectClass(id: number | null): void {
    if (id === null) {
      this._selectedClass.next(null);
      return;
    }
    this.apiService.getClassroomById(id).subscribe({
      next: (classroom: Classroom) => this._selectedClass.next(classroom),
      error: (err: any) => console.error(`Failed to load class with id ${id}`, err)
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
        if (this._selectedClass.value?.id === classId) {
          this._selectedClass.next(null);
        }
      })
    );
  }
}

