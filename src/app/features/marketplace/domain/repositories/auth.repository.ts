export abstract class AuthRepository {
  abstract login(email: string, password: string): Promise<void>;
  abstract logout(): Promise<void>;
  abstract isAuthenticated(): Promise<boolean>;
  abstract getCurrentUser(): Promise<{ email: string } | null>;
}
