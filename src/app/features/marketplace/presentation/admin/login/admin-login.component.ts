import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginUseCase } from '../../../application/use-cases/login.usecase';
import { AdminToastService } from '../../services/admin-toast.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  form: FormGroup;
  isSubmitting = false;
  error: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly login: LoginUseCase,
    private readonly toast: AdminToastService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;
    this.error = null;
    this.login
      .execute(this.form.value.email, this.form.value.password)
      .then(() => {
        this.toast.showSuccess('Sessão iniciada.');
        this.router.navigate(['/marketplace/admin']);
      })
      .catch((e) => {
        const msg = e?.message ?? 'Erro ao iniciar sessão.';
        this.error = msg;
        this.toast.showError(msg);
        this.isSubmitting = false;
      });
  }
}
