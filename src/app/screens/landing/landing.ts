import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="landing-shell">
      <section class="landing-card">
        <p class="eyebrow">Portal clínico</p>
        <h1>RehabWeb</h1>
        <p class="description">
          {{ welcomeMessage() }}
        </p>

        <div class="actions">
          <a routerLink="/login" class="secondary-link">Cambiar de cuenta</a>
          <button type="button" class="logout-button" (click)="logout()">
            Cerrar sesión
          </button>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .landing-shell {
        min-height: 100dvh;
        display: grid;
        place-items: center;
        padding: var(--space-6) var(--space-5);
        background-color: var(--color-bg);
      }

      .landing-card {
        width: min(100%, 42rem);
        padding: clamp(2rem, 4vw, 3.5rem);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
        background: var(--color-surface);
        box-shadow: var(--shadow-lg);
      }

      .eyebrow {
        display: inline-flex;
        margin: 0 0 var(--space-3);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-pill);
        background: var(--color-primary-low);
        color: var(--color-primary);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-wide);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-bold);
      }

      h1 {
        margin: 0;
        font-size: clamp(2rem, 6vw, var(--font-size-2xl));
        font-weight: var(--font-weight-bold);
        line-height: var(--line-height-tight);
        color: var(--color-text);
      }

      .description {
        margin: var(--space-3) 0 0;
        max-width: 34rem;
        color: var(--color-text-secondary);
        font-size: var(--font-size-s);
        line-height: var(--line-height-loose);
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
        margin-top: var(--space-5);
      }

      .secondary-link,
      .logout-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-xl);
        padding: 0.75rem var(--space-4);
        font-size: var(--font-size-s);
        font-weight: var(--font-weight-medium);
        text-decoration: none;
        transition: transform var(--duration-fast) ease;
      }

      .secondary-link {
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        color: var(--color-text);
      }

      .logout-button {
        border: 0;
        background: var(--color-primary);
        color: white;
        cursor: pointer;
      }

      .secondary-link:hover,
      .logout-button:hover {
        transform: translateY(-1px);
      }

      @media (max-width: 900px) {
        .landing-shell {
          padding: var(--space-5) var(--space-4);
        }

        .landing-card {
          width: min(100%, 38rem);
          padding: clamp(1.5rem, 5vw, 2.5rem);
        }
      }

      @media (max-width: 640px) {
        .landing-shell {
          padding: var(--space-4) var(--space-3);
        }

        .actions {
          flex-direction: column;
        }

        .secondary-link,
        .logout-button {
          width: 100%;
        }

        .description {
          max-width: 100%;
        }
      }
    `,
  ],
})
export class LandingComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly welcomeMessage = computed(() => {
    const user = this.authService.currentUser();

    if (!user) {
      return 'La sesión no está activa. Inicia sesión o crea una cuenta para continuar.';
    }

    const displayName = user.first_name || user.username;

    return `Bienvenido, ${displayName}. Espero que tu experiencia en este portal sea de ayuda y muy cómoda para ti.`;
  });

  protected logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
