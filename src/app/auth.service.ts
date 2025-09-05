import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient;
  private session = new BehaviorSubject<Session | null>(null);

  constructor() {
    this.supabase = createClient(
      'https://qjlmzggdecjcbqjsoceh.supabase.co',   // 👈 replace
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbG16Z2dkZWNqY2JxanNvY2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjg2ODAsImV4cCI6MjA3MTgwNDY4MH0.j5aIEMr2jODCdrS_Pqg4hVwKC5Ev4TUUEz9pd5CY9h0',                         // 👈 replace
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );

    // Load current session
    this.supabase.auth.getSession().then(({ data }) => {
      this.session.next(data.session);
    });

    // Subscribe to auth changes
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.session.next(session);
    });
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data; // contains { user, session }
  }
  
  async register(email: string, password: string, meta: any = {}) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: meta },
    });
    if (error) throw error;
    return data; // contains { user, session }
  }

  async logout() {
    return await this.supabase.auth.signOut();
  }

  getCurrentUser(): User | null {
    return this.session.value?.user ?? null;
  }

  // ✅ If you want to listen to session
  getSession$() {
    return this.session.asObservable();
  }

  getSession() {
    return this.session.value;
  }
}
