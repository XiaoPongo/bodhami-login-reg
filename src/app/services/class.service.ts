import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { ApiService, Classroom } from './api.service'; // Import from ApiService

@Injectable({
  providedIn: 'root',
})
export class ClassService {
  // A private BehaviorSubject to hold the current list of classes
  private readonly _classes = new BehaviorSubject<Classroom[]>([]);
  // A public Observable that all components can subscribe to for live updates
  public readonly classes$: Observable<Classroom[]> = this._classes.asObservable();

  constructor(private apiService: ApiService) {
    // Automatically load the initial list of classes when the service is created
    this.loadClasses();
  }

  // --- Public Methods for Components to Use ---

  /** Fetches the latest classes from the API and updates the stream */
  loadClasses(): void {
    this.apiService.getClassrooms().subscribe({
      next: (classes) => this._classes.next(classes),
      error: (err) => console.error("Failed to load classrooms", err)
    });
  }

  /** Creates a new class via the API and then refreshes the local list */
  createClass(name: string, description: string): Observable<Classroom> {
    return this.apiService.createClassroom({ name, description }).pipe(
      // The 'tap' operator performs a side-effect without changing the stream
      tap(() => {
        // After a successful creation, reload the list to show the new class
        this.loadClasses(); 
      })
    );
  }

  /** Deletes a class via the API and then refreshes the local list */
  deleteClass(classId: number): Observable<any> {
    if (!classId) return throwError(() => new Error('Invalid Class ID'));
    return this.apiService.deleteClassroom(classId).pipe(
      tap(() => {
        // After a successful deletion, reload the list to remove the class
        this.loadClasses();
      })
    );
  }
}