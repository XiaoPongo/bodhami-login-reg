// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
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
  name: string;
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
  private apiUrl = 'https://elevana-api-env-v1.eba-kqqge9q6.eu-north-1.elasticbeanstalk.com/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log("🔑 Final token:", token);

    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  // --- Classroom Endpoints ---
  getClassrooms(): Observable<Classroom[]> {
    return this.http.get<Classroom[]>(`${this.apiUrl}/classrooms`, {
      headers: this.getHeaders()
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
      headers: this.getHeaders()
    });
  }

  deleteClassroom(classId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/classrooms/${classId}`, {
      headers: this.getHeaders()
    });
  }
}