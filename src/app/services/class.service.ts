import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, throwError, of } from 'rxjs';
import { ApiService, Classroom, Student } from './api.service'; // Import Student from api.service

@Injectable({
  providedIn: 'root',
})
export class ClassService {
  private readonly _classes = new BehaviorSubject<Classroom[]>([]);
  public readonly classes$: Observable<Classroom[]> = this._classes.asObservable();

  constructor(private apiService: ApiService) {
    this.loadClasses();
  }

  loadClasses(): void {
    this.apiService.getClassrooms().subscribe({
      next: (classes) => this._classes.next(classes),
      error: (err) => console.error("Failed to load classrooms", err)
    });
  }

  createClass(name: string, description: string): Observable<Classroom> {
    return this.apiService.createClassroom({ name, description }).pipe(
      tap(() => {
        this.loadClasses(); 
      })
    );
  }

  deleteClass(classId: number): Observable<any> {
    if (!classId) return throwError(() => new Error('Invalid Class ID'));
    return this.apiService.deleteClassroom(classId).pipe(
      tap(() => {
        this.loadClasses();
      })
    );
  }

  // --- ADDED MISSING METHODS ---
  // These will be wired to the API later. For now, they fix the compile errors.
  addStudentToClass(classId: number, studentEmail: string, studentName: string): Observable<any> {
    console.log(`SERVICE: Adding student ${studentName} (${studentEmail}) to class ${classId}`);
    // In the future, this will return this.apiService.addStudent(...)
    return of({ success: true }); 
  }

  removeStudentFromClass(classId: number, studentId: string): Observable<any> {
    console.log(`SERVICE: Removing student ${studentId} from class ${classId}`);
    // In the future, this will return this.apiService.removeStudent(...)
    return of({ success: true });
  }
}