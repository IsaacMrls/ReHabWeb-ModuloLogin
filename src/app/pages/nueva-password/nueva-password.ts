import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nueva-password',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './nueva-password.html',
  styleUrl: './nueva-password.scss',
})
export class NuevaPassword {

  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  formError = '';

  get passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  get canSubmit(): boolean {
    return (
      this.password.length >= 8 &&
      this.confirmPassword.length >= 8 &&
      this.passwordsMatch
    );
  }

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  guardarPassword() {
    this.formError = '';

    if (!this.password || this.password.length < 8) {
      this.formError = 'La nueva contraseña debe tener al menos 8 caracteres.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.formError = 'Las contraseñas no coinciden.';
      return;
    }

    const email = localStorage.getItem('reset_email') || '';

    if (!email) {
      this.formError = 'No se encontró el correo de recuperación. Inicia el proceso nuevamente.';
      return;
    }

    this.authService.resetPassword(email, this.password).subscribe({

      next: () => {

        alert('Contraseña actualizada correctamente');

        localStorage.removeItem('reset_email');

        this.router.navigate(['/login']);
      },

      error: () => {

        alert('Error al actualizar contraseña');
      }

    });
  }

}
