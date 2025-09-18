import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Response interfaces
interface EnrolledResp { enrolled: any[]; }
interface AvailableResp { available: any[]; }
interface VerifyResp { valid: boolean; message?: string; class?: any; }
interface JoinResp { success: boolean; class?: any; message?: string; }

@Injectable({ providedIn: 'root' })
export class StudentClassesService {
  private apiUrl = '/api'; // 🔑 adjust if your backend uses a different base URL

  constructor(private http: HttpClient) {}

  // Get all classes the student is enrolled in
  getEnrolledClasses(): Observable<EnrolledResp> {
    return this.http.get<EnrolledResp>(`${this.apiUrl}/student/classes`);
  }

  // Get available classes (public or discoverable)
  getAvailableClasses(): Observable<AvailableResp> {
    return this.http.get<AvailableResp>(`${this.apiUrl}/classes/available`);
  }

  // Verify if a class code is valid
  verifyClassCode(code: string): Observable<VerifyResp> {
    return this.http.get<VerifyResp>(`${this.apiUrl}/classes/verify?code=${encodeURIComponent(code)}`);
  }

  // Join a class with a valid code
  joinClassByCode(code: string): Observable<JoinResp> {
    return this.http.post<JoinResp>(`${this.apiUrl}/classes/join`, { code });
  }
}
