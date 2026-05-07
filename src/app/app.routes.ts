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
    path: 'landing',
    loadComponent: () =>
      import('./screens/landing/landing').then((m) => m.LandingComponent),
  },
  { path: '**', redirectTo: 'login' },
];
