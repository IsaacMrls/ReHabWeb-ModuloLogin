import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-2fa',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login-2fa.html',
  styleUrl: './login-2fa.scss',
})
export class Login2FAComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly isSubmitting = signal(false);
  protected readonly apiError = signal('');

  protected readonly emailMasked =
    isPlatformBrowser(this.platformId)
      ? localStorage.getItem('login_2fa_email_masked') || ''
      : '';

  codigo1 = '';
  codigo2 = '';
  codigo3 = '';
  codigo4 = '';
  codigo5 = '';
  codigo6 = '';

  protected verifyCode(): void {
    const loginSession =
      isPlatformBrowser(this.platformId)
        ? localStorage.getItem('login_2fa_session') || ''
        : '';

    if (!loginSession) {
      this.apiError.set('La sesion de acceso expiro. Inicia sesion nuevamente.');
      return;
    }

    const code = `${this.codigo1}${this.codigo2}${this.codigo3}${this.codigo4}${this.codigo5}${this.codigo6}`;

    if (code.length !== 6) {
      this.apiError.set('Ingresa el codigo completo de 6 digitos.');
      return;
    }

    this.apiError.set('');
    this.isSubmitting.set(true);

    this.authService
      .verifyLoginCode({
        login_session: loginSession,
        code,
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('login_2fa_session');
            localStorage.removeItem('login_2fa_email_masked');
          }
          void this.router.navigateByUrl('/landing');
        },
        error: (error) => {
          const rawMessage = error?.error?.detail ?? 'No fue posible validar el codigo.';
          this.apiError.set(rawMessage);
        },
      });
  }

  protected moveToNext(event: Event, nextInput?: HTMLInputElement): void {
    const input = event.target as HTMLInputElement;

    if (input.value.length >= 1 && nextInput) {
      nextInput.focus();
    }
  }
}
