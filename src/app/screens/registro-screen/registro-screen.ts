import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { RegisterPayload, RegisterRole } from '../../models/auth.models';
import { AuthService } from '../../services/auth.service';

/** Solo letras (incluyendo acentos y ñ) y como máximo un espacio simple entre dos palabras. */
function nameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) return null;
    const valid = /^[a-zA-Zà-üÀ-ÜñÑ]+(?: [a-zA-Zà-üÀ-ÜñÑ]+)*$/.test(value);
    return valid ? null : { invalidName: true };
  };
}

/** Formato estricto: local@dominio.tld */
function strictEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) return null;
    const valid = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(value);
    return valid ? null : { invalidEmail: true };
  };
}

function specialtyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) return null;
    const valid = /^[a-zA-Zà-üÀ-ÜñÑ ]{3,}$/.test(value.trim());
    return valid ? null : { invalidSpecialty: true };
  };
}

function professionalLicenseValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) return null;
    const valid = /^[a-zA-Z0-9-]{5,25}$/.test(value.trim());
    return valid ? null : { invalidProfessionalLicense: true };
  };
}

function passwordMatchValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const passwordConfirm = control.get('password_confirm')?.value;

  if (!password || !passwordConfirm) {
    return null;
  }

  return password === passwordConfirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-registro-screen',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro-screen.html',
  styleUrl: './registro-screen.scss',
})
export class RegistroScreenComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly apiError = signal('');
  protected readonly showPassword = signal(false);
  protected readonly showPasswordConfirm = signal(false);
  protected readonly selectedRole = signal<RegisterRole | null>(null);

  protected readonly form = this.formBuilder.nonNullable.group(
    {
      role: ['patient' as RegisterRole, [Validators.required]],
      first_name: ['', [Validators.required, nameValidator()]],
      last_name: ['', [Validators.required, nameValidator()]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, strictEmailValidator()]],
      specialty: [''],
      professional_license: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirm: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  constructor() {
    this.applyRoleValidators('patient');
  }

  protected selectRole(role: RegisterRole): void {
    this.selectedRole.set(role);
    this.form.controls.role.setValue(role);
    this.applyRoleValidators(role);
    this.apiError.set('');
  }

  protected changeRole(): void {
    this.selectedRole.set(null);
    this.apiError.set('');
  }

  protected isTherapistSelected(): boolean {
    return this.selectedRole() === 'therapist';
  }

  protected roleLabel(): string {
    return this.isTherapistSelected() ? 'terapeuta' : 'paciente';
  }

  protected togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  protected togglePasswordConfirm(): void {
    this.showPasswordConfirm.update((v) => !v);
  }

  protected normalizeNameInput(fieldName: 'first_name' | 'last_name'): void {
    const control = this.form.controls[fieldName];
    const rawValue = control.value ?? '';
    const cleaned = rawValue
      .replace(/[^a-zA-Zà-üÀ-ÜñÑ ]+/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^\s+/g, '');

    // Permite multiples palabras separadas por un solo espacio y evita espacio inicial.
    const match = cleaned.match(/^[a-zA-Zà-üÀ-ÜñÑ]+(?: [a-zA-Zà-üÀ-ÜñÑ]*)*$/);
    const normalized = match ? match[0] : cleaned;

    if (normalized !== rawValue) {
      control.setValue(normalized);
    }
  }

  protected normalizeEmailInput(): void {
    const control = this.form.controls.email;
    const rawValue = control.value ?? '';
    const normalized = rawValue.replace(/\s+/g, '').toLowerCase();

    if (normalized !== rawValue) {
      control.setValue(normalized);
    }
  }

  protected normalizeSpecialtyInput(): void {
    const control = this.form.controls.specialty;
    const rawValue = control.value ?? '';
    const cleaned = rawValue
      .replace(/[^a-zA-Zà-üÀ-ÜñÑ ]+/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^\s+/g, '');

    if (cleaned !== rawValue) {
      control.setValue(cleaned);
    }
  }

  protected normalizeProfessionalLicenseInput(): void {
    const control = this.form.controls.professional_license;
    const rawValue = control.value ?? '';
    const normalized = rawValue
      .toUpperCase()
      .replace(/[^A-Z0-9-]+/g, '')
      .slice(0, 25);

    if (normalized !== rawValue) {
      control.setValue(normalized);
    }
  }

  protected submit(): void {
    if (!this.selectedRole()) {
      this.apiError.set('Selecciona primero el tipo de registro.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.apiError.set('');
    this.isSubmitting.set(true);

    this.authService
      .register(this.buildPayload())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/landing');
        },
        error: (error) => {
          const errorBag = error?.error;
          const firstFieldError = Object.values(errorBag ?? {}).find((value) => Array.isArray(value));
          const message = Array.isArray(firstFieldError) ? firstFieldError[0] : errorBag?.detail;
          this.apiError.set(message ?? 'No fue posible crear la cuenta en este momento.');
        },
      });
  }

  protected fieldHasError(
    fieldName:
      | 'role'
      | 'first_name'
      | 'last_name'
      | 'username'
      | 'email'
      | 'specialty'
      | 'professional_license'
      | 'password'
      | 'password_confirm',
  ): boolean {
    const control = this.form.controls[fieldName];
    return control.invalid && (control.dirty || control.touched);
  }

  protected getFieldErrors(fieldName: 'role' | 'first_name' | 'last_name' | 'username' | 'email' | 'specialty' | 'professional_license' | 'password' | 'password_confirm'): ValidationErrors | null {
    const control = this.form.controls[fieldName];
    return (control.dirty || control.touched) ? control.errors : null;
  }

  protected passwordsDoNotMatch(): boolean {
    return !!this.form.errors?.['passwordMismatch'] && (this.form.dirty || this.form.touched);
  }

  private applyRoleValidators(role: RegisterRole): void {
    const specialtyControl = this.form.controls.specialty;
    const professionalLicenseControl = this.form.controls.professional_license;

    if (role === 'therapist') {
      specialtyControl.setValidators([Validators.required, specialtyValidator()]);
      professionalLicenseControl.setValidators([
        Validators.required,
        professionalLicenseValidator(),
      ]);
    } else {
      specialtyControl.clearValidators();
      professionalLicenseControl.clearValidators();
      specialtyControl.setValue('');
      professionalLicenseControl.setValue('');
    }

    specialtyControl.updateValueAndValidity();
    professionalLicenseControl.updateValueAndValidity();
  }

  private buildPayload(): RegisterPayload {
    const value = this.form.getRawValue();

    return {
      role: value.role,
      first_name: value.first_name,
      last_name: value.last_name,
      username: value.username,
      email: value.email,
      password: value.password,
      password_confirm: value.password_confirm,
      ...(value.role === 'therapist'
        ? {
            specialty: value.specialty.trim(),
            professional_license: value.professional_license.trim(),
          }
        : {}),
    };
  }
}
