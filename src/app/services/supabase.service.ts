import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthResponse } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://qjlmzggdecjcbqjsoceh.supabase.co',
      'bMHghSb7kEfD06ak'
    );
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    return this.supabase.auth.signUp({ email, password });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  async getUser() {
    return this.supabase.auth.getUser();
  }
}
