import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://jsonplaceholder.typicode.com/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}

// ✅ User interface with all expected fields
export interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  role?: string;
  preferences?: any; // optional to avoid TS errors
}
