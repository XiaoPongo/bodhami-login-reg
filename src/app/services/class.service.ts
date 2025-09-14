import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, throwError, of } from 'rxjs';
// Correctly import all models from api.service
import { ApiService, Classroom, Student } from './api.service'; 
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root',
})
export class ClassService {
  private readonly _classes = new BehaviorSubject<Classroom[]>([]);
  public readonly classes$: Observable<Classroom[]> = this._classes.asObservable();

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
    // Only load classes once we actually have a session
    this.authService.getSession$().subscribe(session => {
      if (session) {
        this.loadClasses();
      }
    });
  }
  

  loadClasses(): void {
    this.apiService.getClassrooms().subscribe({
      next: (classes) => {
        console.log("📦 API returned classes:", classes);
        this._classes.next(classes);
      },
      error: (err) => console.error("❌ Failed to load classrooms", err)
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
      tap(() => this.loadClasses())
    );
  }
  
  // --- ADDED MISSING METHODS (MOCKED FOR NOW) ---
  addStudentToClass(classId: number, studentEmail: string): Observable<any> {
    console.log(`SERVICE: Adding student ${studentEmail} to class ${classId}`);
    return of({ success: true }); 
  }

  removeStudentFromClass(classId: number, studentId: string): Observable<any> {
    console.log(`SERVICE: Removing student ${studentId} from class ${classId}`);
    return of({ success: true });
  }
}