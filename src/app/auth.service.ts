// src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient;
  private session = new BehaviorSubject<Session | null>(null);

  constructor() {
    // This is now the ONLY place in your app where the Supabase client is created.
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    this.supabase.auth.getSession().then(({ data }) => {
      this.session.next(data.session);
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.session.next(session);
    });
  }

  // --- Core Authentication Methods ---

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async register(email: string, password: string, meta: any = {}) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: meta },
    });
    if (error) throw error;
    return data;
  }

  async logout() {
    return await this.supabase.auth.signOut();
  }

  // --- Session & User Management ---

  getCurrentUser(): User | null {
    return this.session.value?.user ?? null;
  }
  
  /**
   * Fetches the latest user details directly from Supabase.
   * This was previously in supabase.service.ts and is now integrated here.
   */
  getUser() {
    return this.supabase.auth.getUser();
  }

  getSession$() {
    return this.session.asObservable();
  }

  getSession() {
    return this.session.value;
  }
  
  getToken(): string | null {
    return this.session.value?.access_token ?? null; 
  }
}