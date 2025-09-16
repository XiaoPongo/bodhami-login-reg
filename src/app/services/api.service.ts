import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../auth.service';

// --- DEFINITIVE DATA MODELS ---
export interface Student { id: string; name: string; email: string; xp: number; }
export interface Activity { id: number; title: string; type: string; xp: number; s3Url: string; }
export interface Material {
  id: number;
  displayName: string;
  s3Url: string;
  fileType: string;
  mentorId: string;
  uploadedAt: Date;
  classroom: Classroom | null;
}
export interface Classroom {
  id: number; name: string; description: string; classCode: string; mentorId: string;
  allowNewStudents: boolean; materials: Material[]; activities: Activity[]; students: Student[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'https://api-test.thebandar.co.in/api';

  constructor(private http: HttpClient, private authService: AuthService) { }

  /**
   * Creates the authorization headers for API requests.
   */
  private getAuthHeaders(): Observable<HttpHeaders> {
    const session = this.authService.getSession();
    const token = session?.access_token;
    
    if (!token) {
        console.error("Authentication Error: No session token found. API call cancelled.");
        return throwError(() => new Error('User not authenticated! No token available.'));
    }
    
    const headersConfig: { [key: string]: string } = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    return of(new HttpHeaders(headersConfig));
  }

  // --- Classroom Endpoints ---
  createClassroom(data: { name: string, description: string }): Observable<Classroom> {
    // CRITICAL FIX: Corrected `this->apiUrl` to `this.apiUrl`
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.post<Classroom>(`${this.apiUrl}/classrooms`, data, { headers }))
    );
  }

  getClassrooms(): Observable<Classroom[]> {
    // CRITICAL FIX: Corrected `this->apiUrl` to `this.apiUrl`
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.get<Classroom[]>(`${this.apiUrl}/classrooms`, { headers }))
    );
  }

  updateClassroom(id: number, data: { name: string, description: string }): Observable<Classroom> {
    // CRITICAL FIX: Corrected `this->apiUrl` to `this.apiUrl`
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.put<Classroom>(`${this.apiUrl}/classrooms/${id}`, data, { headers }))
    );
  }

  deleteClassroom(id: number): Observable<any> {
    // CRITICAL FIX: Corrected `this->apiUrl` to `this.apiUrl`
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.apiUrl}/classrooms/${id}`, { headers }))
    );
  }

  removeStudentFromClass(classroomId: number, studentId: string): Observable<any> {
    // CRITICAL FIX: Corrected `this->apiUrl` to `this.apiUrl`
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.apiUrl}/classrooms/${classroomId}/students/${studentId}`, { headers }))
    );
  }

  unassignActivityFromClass(classroomId: number, activityId: number): Observable<any> {
    // CRITICAL FIX: Corrected `this->apiUrl` to `this.apiUrl`
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.apiUrl}/classrooms/${classroomId}/activities/${activityId}`, { headers }))
    );
  }
  
  assignMaterials(materialIds: number[], classroomId: number | null): Observable<any> {
    const payload = { materialIds, classroomId };
    // CRITICAL FIX: Corrected `this->apiUrl` to `this.apiUrl`
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.post(`${this.apiUrl}/materials/assign`, payload, { headers }))
    );
  }
}

