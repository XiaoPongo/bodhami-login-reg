// src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient;
  private currentUser: User | null = null;

  constructor() {
    this.supabase = createClient(
      'https://qjlmzggdecjcbqjsoceh.supabase.co',
      'bMHghSb7kEfD06ak' // ⚠️ replace with anon key
    );

    const savedUser = localStorage.getItem('loggedInUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  // ✅ Login
  async login(email: string, password: string): Promise<{ user: User | null; error: any }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

    if (error) return { user: null, error };

    this.currentUser = data.user;
    localStorage.setItem('loggedInUser', JSON.stringify(data.user));
    return { user: data.user, error: null };
  }

  // ✅ Register (with role metadata)
  async register(
    email: string,
    password: string,
    role: 'mentor' | 'student'
  ): Promise<{ user: User | null; error: any }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { role } } // 🎯 store role in user_metadata
    });

    if (error) return { user: null, error };

    this.currentUser = data.user;
    localStorage.setItem('loggedInUser', JSON.stringify(data.user));
    return { user: data.user, error: null };
  }

  // ✅ Logout
  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this.currentUser = null;
    localStorage.removeItem('loggedInUser');
  }

  // ✅ Session helpers
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}
