import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

// --- INTERFACES ---
export interface Student {
  id: string;
  name: string;
  email: string;
  progress: number; // e.g., 75%
}

export interface Classroom {
  id: string;
  name: string;
  description: string;
  classCode: string;
  students: Student[];
  createdAt: Date;
}

// --- SERVICE ---
@Injectable({
  providedIn: 'root'
})
export class ClassService {
  // Using a BehaviorSubject to simulate a reactive data store
  private _classes$ = new BehaviorSubject<Classroom[]>([]);

  constructor() {
    // Initialize with mock data when the service is first created
    this.loadInitialMockData();
  }

  // --- PUBLIC API ---

  /** Returns an observable stream of all classes */
  getClasses(): Observable<Classroom[]> {
    return this._classes$.asObservable();
  }

  /** Creates a new class and adds it to the store */
  createClass(name: string, description: string): Observable<Classroom> {
    const newClass: Classroom = {
      id: this.generateId(),
      name,
      description,
      classCode: this.generateClassCode(),
      students: [],
      createdAt: new Date()
    };

    const currentClasses = this._classes$.getValue();
    this._classes$.next([...currentClasses, newClass]);
    
    return of(newClass); // Return the newly created class
  }

  /** Adds a student to a specific class */
  addStudentToClass(classId: string, studentEmail: string, studentName: string): Observable<boolean> {
      const currentClasses = this._classes$.getValue();
      const classIndex = currentClasses.findIndex(c => c.id === classId);

      if (classIndex === -1) {
        console.error("Class not found!");
        return of(false);
      }

      const newStudent: Student = {
        id: this.generateId(),
        name: studentName,
        email: studentEmail,
        progress: 0
      };

      // Ensure student isn't already in the class
      if (currentClasses[classIndex].students.some(s => s.email === studentEmail)) {
        console.warn("Student already in class");
        return of(false);
      }
      
      currentClasses[classIndex].students.push(newStudent);
      this._classes$.next([...currentClasses]);
      return of(true);
  }

  /** Removes a student from a class */
  removeStudentFromClass(classId: string, studentId: string): Observable<boolean> {
    const currentClasses = this._classes$.getValue();
    const classIndex = currentClasses.findIndex(c => c.id === classId);

    if (classIndex === -1) {
      return of(false);
    }

    currentClasses[classIndex].students = currentClasses[classIndex].students.filter(s => s.id !== studentId);
    this._classes$.next([...currentClasses]);
    return of(true);
  }


  // --- HELPER & MOCK DATA METHODS ---

  private generateClassCode(): string {
    // Generates a 6-character alphanumeric code (e.g., A3B-K2P)
    const part1 = Math.random().toString(36).substring(2, 5).toUpperCase();
    const part2 = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${part1}-${part2}`;
  }

  private generateId(): string {
    return '_' + Math.random().toString(36).substring(2, 11);
  }
  
  private loadInitialMockData() {
    const mockStudents1: Student[] = [
      { id: 's1', name: 'Alice Johnson', email: 'alice@example.com', progress: 85 },
      { id: 's2', name: 'Bob Williams', email: 'bob@example.com', progress: 92 },
    ];
    const mockStudents2: Student[] = [
      { id: 's3', name: 'Charlie Brown', email: 'charlie@example.com', progress: 71 },
    ];

    const mockClasses: Classroom[] = [
      {
        id: 'c1',
        name: 'Grade 6 Science - 2025',
        description: 'Exploring biology, chemistry, and physics for the modern world.',
        classCode: this.generateClassCode(),
        students: mockStudents1,
        createdAt: new Date('2025-08-15T10:00:00Z')
      },
      {
        id: 'c2',
        name: 'History 101',
        description: 'A survey of world history from ancient civilizations to the present.',
        classCode: this.generateClassCode(),
        students: mockStudents2,
        createdAt: new Date('2025-09-01T11:30:00Z')
      }
    ];
    this._classes$.next(mockClasses);
  }
}
