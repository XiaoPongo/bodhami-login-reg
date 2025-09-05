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
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbG16Z2dkZWNqY2JxanNvY2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjg2ODAsImV4cCI6MjA3MTgwNDY4MH0.j5aIEMr2jODCdrS_Pqg4hVwKC5Ev4TUUEz9pd5CY9h0' 
    );

    const savedUser = localStorage.getItem('loggedInUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  // ✅ Login with email/password
  async login(
    email: string,
    password: string
  ): Promise<{ user: User | null; error: any }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { user: null, error };

    this.currentUser = data.user;
    localStorage.setItem('loggedInUser', JSON.stringify(data.user));
    return { user: data.user, error: null };
  }

  // ✅ Register + insert into profiles table
  async register(
    email: string,
    password: string,
    role: 'mentor' | 'student',
    profile?: {
      firstName?: string;
      lastName?: string;
      country?: string;
      phone?: string;
      postalCode?: string;
    }
  ): Promise<{ user: User | null; error: any }> {
    // 1) Sign up in auth
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role }, // store role also in user_metadata
      },
    });

    if (error) {
      return { user: null, error };
    }

    const user = data.user;
    if (!user || !user.id) {
      return { user: null, error: { message: 'No user returned from signUp' } };
    }

    // 2) Insert profile row (client-side RLS will allow this)
    if (profile) {
      const { error: insertError } = await this.supabase.from('profiles').insert([
        {
          id: user.id,
          role,
          first_name: profile.firstName ?? null,
          last_name: profile.lastName ?? null,
          country: profile.country ?? null,
          phone: profile.phone ?? null,
          postal_code: profile.postalCode ?? null,
        },
      ]);

      if (insertError) {
        // ⚠️ account is already created in auth.users
        return { user, error: insertError };
      }
    }

    // 3) Save session locally
    this.currentUser = user;
    localStorage.setItem('loggedInUser', JSON.stringify(user));

    return { user, error: null };
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
