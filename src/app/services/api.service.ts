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
   * Handles both JSON and FormData content types.
   */
  private getAuthHeaders(isFormData: boolean = false): Observable<HttpHeaders> {
    const session = this.authService.getSession();
    const token = session?.access_token;
    
    if (!token) {
        console.error("Authentication Error: No session token found. API call cancelled.");
        return throwError(() => new Error('User not authenticated! No token available.'));
    }
    
    let headersConfig: { [key: string]: string } = { 'Authorization': `Bearer ${token}` };
    if (!isFormData) {
      headersConfig['Content-Type'] = 'application/json';
    }
    
    return of(new HttpHeaders(headersConfig));
  }

  // --- Activity CSV Upload ---
  uploadFile(file: Blob, type: string, fileName: string, classroomId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, fileName);
    const uploadUrl = `${this.apiUrl}/upload/${classroomId}/${type}`;
    return this.getAuthHeaders(true).pipe(
      switchMap(headers => this.http.post(uploadUrl, formData, { headers }))
    );
  }
  
  // --- MATERIAL ENDPOINTS ---
  getMaterials(): Observable<Material[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.get<Material[]>(`${this.apiUrl}/materials`, { headers }))
    );
  }

  uploadMaterial(file: File, classId: number): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('displayName', file.name);
    formData.append('file', file, file.name);
    const uploadUrl = `${this.apiUrl}/classrooms/${classId}/materials`;
    return this.getAuthHeaders(true).pipe(
      switchMap(headers => this.http.post(uploadUrl, formData, {
        headers, reportProgress: true, observe: 'events'
      }))
    );
  }
  
  deleteMaterial(id: number): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.apiUrl}/materials/${id}`, { headers }))
    );
  }

  deleteMaterials(ids: number[]): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.request('delete', `${this.apiUrl}/materials`, { headers, body: ids }))
    );
  }

  assignMaterials(materialIds: number[], classroomId: number | null): Observable<any> {
    const payload = { materialIds, classroomId };
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.post(`${this.apiUrl}/materials/assign`, payload, { headers }))
    );
  }

  // --- Classroom Endpoints ---
  createClassroom(data: { name: string, description: string }): Observable<Classroom> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.post<Classroom>(`${this.apiUrl}/classrooms`, data, { headers }))
    );
  }

  getClassrooms(): Observable<Classroom[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.get<Classroom[]>(`${this.apiUrl}/classrooms`, { headers }))
    );
  }

  updateClassroom(id: number, data: { name: string, description: string }): Observable<Classroom> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.put<Classroom>(`${this.apiUrl}/classrooms/${id}`, data, { headers }))
    );
  }

  deleteClassroom(id: number): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.apiUrl}/classrooms/${id}`, { headers }))
    );
  }

  removeStudentFromClass(classroomId: number, studentId: string): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.apiUrl}/classrooms/${classroomId}/students/${studentId}`, { headers }))
    );
  }

  unassignActivityFromClass(classroomId: number, activityId: number): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.apiUrl}/classrooms/${classroomId}/activities/${activityId}`, { headers }))
    );
  }
}