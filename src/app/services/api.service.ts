import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Observable, of, throwError, firstValueFrom } from 'rxjs';
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
  fileSize: number;
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

  private getAuthHeaders(isFormData: boolean = false): Observable<HttpHeaders> {
    const session = this.authService.getSession();
    const token = session?.access_token;

    if (!token) {
      return throwError(() => new Error('User not authenticated!'));
    }

    let headersConfig: { [key: string]: string } = { 'Authorization': `Bearer ${token}` };
    if (!isFormData) headersConfig['Content-Type'] = 'application/json';

    return of(new HttpHeaders(headersConfig));
  }

  // --- STUDENT ENDPOINTS ---
  getStudentProfile(): Promise<Student> {
    return firstValueFrom(this.getAuthHeaders().pipe(
      switchMap(headers => this.http.get<Student>(`${this.apiUrl}/student/profile`, { headers }))
    ));
  }

  addStudentXp(xp: number): Promise<Student> {
    return firstValueFrom(this.getAuthHeaders().pipe(
      switchMap(headers => this.http.post<Student>(`${this.apiUrl}/student/add-xp`, { xp }, { headers }))
    ));
  }

  // --- MATERIAL ENDPOINTS ---
  getMaterials(): Observable<Material[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.get<Material[]>(`${this.apiUrl}/materials`, { headers }))
    );
  }

  uploadMaterial(file: File, classroomId: number): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('classroomId', classroomId.toString());

    return this.getAuthHeaders(true).pipe(
      switchMap(headers =>
        this.http.post(`${this.apiUrl}/materials/upload`, formData, {
          headers,
          reportProgress: true,
          observe: 'events'
        })
      )
    );
  }

  getMaterialDownloadUrl(materialId: number): Observable<{ url: string }> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.get<{ url: string }>(`${this.apiUrl}/materials/${materialId}/download-url`, { headers }))
    );
  }

  deleteMaterials(ids: number[]): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.request('delete', `${this.apiUrl}/materials`, {
        headers,
        body: { materialIds: ids }
      }))
    );
  }

  assignMaterials(materialIds: number[], classroomId: number | null): Observable<any> {
    const payload = { materialIds, classroomId };
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.post(`${this.apiUrl}/materials/assign`, payload, { headers }))
    );
  }

  // --- CLASSROOM ENDPOINTS ---
  getClassrooms(): Observable<Classroom[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.get<Classroom[]>(`${this.apiUrl}/classrooms`, { headers }))
    );
  }

  createClassroom(data: { name: string, description: string }): Observable<Classroom> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.post<Classroom>(`${this.apiUrl}/classrooms`, data, { headers }))
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

  // legacy method, keep for compatibility if needed
  uploadFile(file: Blob, type: string, fileName: string, classroomId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, fileName);
    const uploadUrl = `${this.apiUrl}/upload/${classroomId}/${type}`;
    return this.getAuthHeaders(true).pipe(
      switchMap(headers => this.http.post(uploadUrl, formData, { headers }))
    );
  }

}