import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () =>
      import('./screens/login-screen/login-screen').then(
        (m) => m.LoginScreenComponent,
      ),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./screens/registro-screen/registro-screen').then(
        (m) => m.RegistroScreenComponent,
      ),
  },
  {
    path: 'login-2fa',
    loadComponent: () =>
      import('./screens/login-2fa/login-2fa').then(
        (m) => m.Login2FAComponent,
      ),
  },
  {
    path: 'recuperar-password',
    loadComponent: () =>
      import('./pages/recuperar-password/recuperar-password').then(
        (m) => m.RecuperarPassword,
      ),
  },
  {
    path: 'verificar-codigo',
    loadComponent: () =>
      import('./pages/verificar-codigo/verificar-codigo').then(
        (m) => m.VerificarCodigo,
      ),
  },
  {
    path: 'nueva-password',
    loadComponent: () =>
      import('./pages/nueva-password/nueva-password').then(
        (m) => m.NuevaPassword,
      ),
  },
  {
    path: 'landing',
    loadComponent: () =>
      import('./screens/landing/landing').then((m) => m.LandingComponent),
  },
  { path: '**', redirectTo: 'login' },
];
