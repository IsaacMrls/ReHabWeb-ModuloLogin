import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './recuperar-password.html',
  styleUrl: './recuperar-password.scss',
})

export class RecuperarPassword {

  email = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  enviarCodigo() {

    this.authService.sendRecoveryCode(this.email).subscribe({

      next: (response: any) => {

        localStorage.setItem('reset_email', this.email);

        // Guardar código
        localStorage.setItem(
          'codigo_recuperacion',
          response.codigo
        );

        alert('Código enviado correctamente');

        this.router.navigate(['/verificar-codigo']);
      },

      error: () => {

        alert('Error al enviar el código');

      }

    });

  }

}