import { Injectable } from '@angular/core';
import { AuthRepository } from '../../domain/repositories/auth.repository';

@Injectable()
export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(email: string, password: string): Promise<void> {
    await this.authRepository.login(email, password);
  }
}
