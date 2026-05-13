import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-screen',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-screen.html',
  styleUrl: './login-screen.scss',
})
export class LoginScreenComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly apiError = signal('');
  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.apiError.set('');
    this.isSubmitting.set(true);

    this.authService
      .requestLoginCode(this.form.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          localStorage.setItem('login_2fa_session', response.login_session);
          localStorage.setItem('login_2fa_email_masked', response.email_masked);
          void this.router.navigateByUrl('/login-2fa');
        },
        error: (error) => {
          const rawMessage = error?.error?.non_field_errors?.[0] ?? error?.error?.detail;
          const normalized = String(rawMessage ?? '').toLowerCase();
          const isInvalidCredentials =
            error?.status === 401 ||
            normalized.includes('credencial') ||
            normalized.includes('credential') ||
            normalized.includes('invalid');

          if (isInvalidCredentials) {
            this.apiError.set('Usuario o contraseña incorrectas.');
            return;
          }

          this.apiError.set(rawMessage ?? 'No fue posible iniciar sesión en este momento.');
        },
      });
  }

  protected fieldHasError(fieldName: 'username' | 'password'): boolean {
    const control = this.form.controls[fieldName];
    return control.invalid && (control.dirty || control.touched);
  }
}
