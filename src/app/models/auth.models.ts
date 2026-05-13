export type RegisterRole = 'patient' | 'therapist';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: RegisterRole;
  specialty?: string | null;
  professional_license?: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface Login2FAStartResponse {
  requires_2fa: boolean;
  login_session: string;
  email_masked: string;
  message: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface Login2FAVerifyPayload {
  login_session: string;
  code: string;
}

export interface RegisterPayload extends LoginPayload {
  role: RegisterRole;
  email: string;
  first_name: string;
  last_name: string;
  password_confirm: string;
  specialty?: string;
  professional_license?: string;
}
