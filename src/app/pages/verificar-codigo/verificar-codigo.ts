import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verificar-codigo',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './verificar-codigo.html',
  styleUrl: './verificar-codigo.scss',
})

export class VerificarCodigo {

  codigo1 = '';
  codigo2 = '';
  codigo3 = '';
  codigo4 = '';
  codigo5 = '';
  codigo6 = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  verificarCodigo() {

    const codigo =
  this.codigo1 +
  this.codigo2 +
  this.codigo3 +
  this.codigo4 +
  this.codigo5 +
  this.codigo6;

const email = localStorage.getItem('reset_email') || '';

this.authService.verifyCode(email, codigo).subscribe({
  
      next: (response: any) => {

        if (response.success) {

          alert('Código correcto');

          this.router.navigate(['/nueva-password']);

        } else {

          alert('Código incorrecto');

        }

      },

      error: () => {

        alert('Error al verificar el código');

      }

    });

  }

  moveToNext(event: any, nextInput?: HTMLInputElement) {

    const input = event.target;

    if (input.value.length >= 1 && nextInput) {
      nextInput.focus();
    }
  }

}