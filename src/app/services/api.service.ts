import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../auth.service';

// --- EXPORTS ---
export interface Student {
  id: string;
  name: string;
  email: string;
  xp: number;
}

export interface Classroom {
  id?: number;
  name:string;
  description: string;
  classCode?: string;
  mentorId?: string;
  allowNewStudents?: boolean;
  materials?: any[];
  activities?: any[];
  students?: Student[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://api-test.thebandar.co.in/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // This getHeaders is for JSON content
  private getJsonHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  // --- THIS IS THE NEW, CRITICAL METHOD ---
  uploadFile(file: Blob, type: 'mission' | 'case-study' | 'minigame', fileName: string, classroomId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, fileName);

    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
    
    // For multipart/form-data, only set the Authorization header.
    // The browser will automatically set the Content-Type with the correct boundary.
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const uploadUrl = `${this.apiUrl}/upload/${classroomId}/${type}`;
    
    return this.http.post(uploadUrl, formData, { headers }).pipe(
      catchError(err => {
        console.error(`❌ Failed to upload ${type} file`, err);
        return throwError(() => err);
      })
    );
  }

  // --- Classroom Endpoints (Unchanged) ---
  getClassrooms(): Observable<Classroom[]> {
    return this.http.get<Classroom[]>(`${this.apiUrl}/classrooms`, {
      headers: this.getJsonHeaders()
    }).pipe(
      tap(classes => console.log("📦 API returned classes:", classes)),
      catchError(err => {
        console.error("❌ Failed to load classrooms", err);
        return throwError(() => err);
      })
    );
  }

  createClassroom(classroomData: { name: string, description: string }): Observable<Classroom> {
    return this.http.post<Classroom>(`${this.apiUrl}/classrooms`, classroomData, {
      headers: this.getJsonHeaders()
    });
  }

  deleteClassroom(classId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/classrooms/${classId}`, {
      headers: this.getJsonHeaders()
    });
  }
}