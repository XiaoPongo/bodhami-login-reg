import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../auth.service';

// Define an interface for the Classroom object for type safety
export interface Classroom {
  id?: number;
  name: string;
  description: string;
  classCode?: string;
  mentorId?: string;
  allowNewStudents?: boolean;
  materials?: any[]; // Define more specific types later
  activities?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Use the public URL of your deployed AWS API
  private apiUrl = 'http://elevana-api-env-v1.eba-kqqge9q6.eu-north-1.elasticbeanstalk.com/api';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): Observable<HttpHeaders> {
    // Get the session synchronously from your service
    const session = this.authService.getSession();
    const token = session?.access_token;

    if (!token) {
      // If there's no token, return an Observable that immediately errors out.
      return throwError(() => new Error('User not authenticated! Cannot make API call.'));
    }

    // If a token exists, create and return an Observable that emits the headers.
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return of(headers); // `of` creates an Observable that emits a single value.
  }

  // --- Classroom Endpoints ---

  getClassrooms(): Observable<Classroom[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.get<Classroom[]>(`${this.apiUrl}/classrooms`, { headers });
      })
    );
  }

  createClassroom(classroomData: { name: string, description: string }): Observable<Classroom> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.post<Classroom>(`${this.apiUrl}/classrooms`, classroomData, { headers });
      })
    );
  }
  
  deleteClassroom(classId: number): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.delete(`${this.apiUrl}/classrooms/${classId}`, { headers });
      })
    );
  }
  
  // You can add more methods here later (updateClassroom, uploadFile, etc.)
}