import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../auth.service';

// --- ADDED EXPORT ---
export interface Student {
  id: string;
  name: string;
  email: string;
  xp: number;
}

// --- UPDATED CLASSROOM INTERFACE ---
export interface Classroom {
  id?: number;
  name: string;
  description: string;
  classCode?: string;
  mentorId?: string;
  allowNewStudents?: boolean;
  materials?: any[]; 
  activities?: any[];
  students?: Student[]; // <-- ADDED THIS MISSING PROPERTY
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://elevana-api-env-v1.eba-kqqge9q6.eu-north-1.elasticbeanstalk.com/api';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): Observable<HttpHeaders> {
    const session = this.authService.getSession();
    const token = session?.access_token;

    if (!token) {
      return throwError(() => new Error('User not authenticated! Cannot make API call.'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return of(headers);
  }

  // --- Classroom Endpoints ---
  getClassrooms(): Observable<Classroom[]> {
    const user = this.authService.getCurrentUser();
    const mentorId = user?.id;
  
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        let url = `${this.apiUrl}/classrooms`;
        
        // If your API expects mentor filtering, add it here
        if (mentorId) {
          url += `?mentorId=${mentorId}`;
        }
  
        return this.http.get<Classroom[]>(url, { headers });
      })
    );
  }
  

  createClassroom(classroomData: { name: string, description: string }): Observable<Classroom> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.post<Classroom>(`${this.apiUrl}/classrooms`, classroomData, { headers }))
    );
  }
  
  deleteClassroom(classId: number): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.apiUrl}/classrooms/${classId}`, { headers }))
    );
  }
}