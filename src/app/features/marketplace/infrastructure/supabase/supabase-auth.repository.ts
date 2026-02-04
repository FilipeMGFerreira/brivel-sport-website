import { AuthRepository } from '../../domain/repositories/auth.repository';
import { getSupabaseClient } from './supabase.client';

export class SupabaseAuthRepository extends AuthRepository {
  async login(email: string, password: string): Promise<void> {
    const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }

  async logout(): Promise<void> {
    await getSupabaseClient().auth.signOut();
  }

  async isAuthenticated(): Promise<boolean> {
    const { data } = await getSupabaseClient().auth.getUser();
    return !!data.user;
  }

  async getCurrentUser(): Promise<{ email: string } | null> {
    const { data } = await getSupabaseClient().auth.getUser();
    const email = data.user?.email;
    return email ? { email } : null;
  }
}
