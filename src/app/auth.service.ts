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
      'https://YOUR-PROJECT-ID.supabase.co',   // 👈 replace
      'YOUR-ANON-KEY',                         // 👈 replace
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
