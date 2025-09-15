import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../auth.service';

// --- DEFINITIVE DATA MODELS ---
export interface Student {
  id: string; name: string; email: string; xp: number;
}
export interface Activity {
  id: number; title: string; type: string; xp: number; s3Url: string;
}
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

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://api-test.thebandar.co.in/api';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(isFormData: boolean = false): Observable<HttpHeaders> {
    const session = this.authService.getSession();
    const token = session?.access_token;
    if (!token) {
      return throwError(() => new Error('User not authenticated!'));
    }
    let headersConfig: { [key: string]: string } = {
      'Authorization': `Bearer ${token}`
    };
    if (!isFormData) {
      headersConfig['Content-Type'] = 'application/json';
    }
    return of(new HttpHeaders(headersConfig));
  }

  // --- Activity CSV Upload ---
  uploadFile(file: Blob, type: 'mission' | 'case-study' | 'minigame', fileName: string, classroomId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, fileName);
    const uploadUrl = `${this.apiUrl}/upload/${classroomId}/${type}`;
    return this.getAuthHeaders(true).pipe(
      switchMap(headers => this.http.post(uploadUrl, formData, { headers }))
    );
  }
  
  // --- NEW: General Material Upload Endpoint ---
  uploadMaterial(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('displayName', file.name);
    formData.append('file', file, file.name);
    
    return this.getAuthHeaders(true).pipe(
      switchMap(headers => {
        return this.http.post(`${this.apiUrl}/materials/upload`, formData, {
          headers: headers,
          reportProgress: true, // This is crucial for progress bars
          observe: 'events'
        });
      })
    );
  }
  
  deleteMaterial(id: number): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.apiUrl}/materials/${id}`, { headers }))
    );
  }

  // --- Classroom Endpoints ---
  getClassrooms(): Observable<Classroom[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.get<Classroom[]>(`${this.apiUrl}/classrooms`, { headers }))
    );
  }
  
  getClassroomById(id: number): Observable<Classroom> {
     return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.get<Classroom>(`${this.apiUrl}/classrooms/${id}/content`, { headers }))
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