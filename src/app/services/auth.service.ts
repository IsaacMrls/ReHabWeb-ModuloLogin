import { HttpClient } from '@angular/common/http';
import { PLATFORM_ID, computed, inject, Injectable, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { tap } from 'rxjs/operators';
import {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '../models/auth.models';

interface PersistedSession {
  token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = 'http://127.0.0.1:8000/api/auth';
  private readonly storageKey = 'rehabweb.auth';
  private readonly session = signal<PersistedSession | null>(this.readSession());

  readonly currentUser = computed(() => this.session()?.user ?? null);
  readonly token = computed(() => this.session()?.token ?? null);

  login(payload: LoginPayload) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login/`, payload)
      .pipe(tap((response) => this.persistSession(response)));
  }

  register(payload: RegisterPayload) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register/`, payload)
      .pipe(tap((response) => this.persistSession(response)));
  }

  logout(): void {
    this.session.set(null);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.storageKey);
    }
  }

  private persistSession(response: AuthResponse): void {
    const session: PersistedSession = {
      token: response.token,
      user: response.user,
    };

    this.session.set(session);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, JSON.stringify(session));
    }
  }

  private readSession(): PersistedSession | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const rawSession = localStorage.getItem(this.storageKey);

    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as PersistedSession;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
