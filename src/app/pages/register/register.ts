import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth/auth';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialog } from '../../shared/components/success-dialog/success-dialog';

type Role = 'Farmer' | string;

type RegisterAddress = {
  Latitude: number;
  Longitude: number;
  IsDefault?: boolean;
  Label?: number;
};

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnDestroy {
  private readonly authService = inject(Auth);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  readonly fullNamePattern = /^[\p{L}]+(?: [\p{L}'-]+)*$/u;
  readonly userNamePattern = /^[a-zA-Z0-9._]{3,20}$/;
  readonly emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})*$/;
  // الـ regex الجديد يتطلب حرف خاص واحد على الأقل
  readonly passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  selectedRole: Role = 'Farmer';
  imageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  locationError = '';
  locationSuccess = false;
  isSubmitting = false;
  errorMessage = '';

  setRole(role: Role): void {
    if (!this.isSubmitting) {
      this.selectedRole = role;
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.[0] ?? null;

    if (selectedFile) {
      this.updateSelectedImage(selectedFile);
      return;
    }

    this.removeSelectedImage(input);
  }

  removeSelectedImage(input?: HTMLInputElement | null): void {
    this.imageFile = null;
    this.revokeImagePreview();

    if (input) {
      input.value = '';
    }
  }

  onSubmit(form: NgForm): void {
    this.errorMessage = '';
    this.locationError = '';
    
    if (this.shouldStopSubmission(form)) {
      return;
    }

    this.prepareForSubmission();

    if (!this.browserSupportsGeolocation()) {
      this.handleLocationError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const address = this.buildAddressFromLocation(form, position);
        this.locationSuccess = true;
        this.submitRegistration(form, address);
      },
      (error) => {
        console.error('Geolocation error:', error);
        this.handleLocationError('Location access is required to create your account. Please enable location services and try again.');
      },
    );
  }

  private shouldStopSubmission(form: NgForm): boolean {
    if (form.invalid) {
      // التحقق من صحة كلمة المرور بشكل إضافي
      if (form.value.Password && !this.passwordPattern.test(form.value.Password)) {
        this.errorMessage = 'Password must contain at least one special character (@$!%*?&)';
      } else {
        this.errorMessage = 'Please fill all required fields correctly';
      }
      return true;
    }
    
    if (this.isSubmitting) {
      return true;
    }
    
    // التحقق من تطابق كلمة المرور
    if (form.value.Password !== form.value.ConfirmedPassword) {
      this.errorMessage = 'Passwords do not match';
      return true;
    }
    
    return false;
  }

  private prepareForSubmission(): void {
    this.locationError = '';
    this.locationSuccess = false;
    this.isSubmitting = true;
    this.errorMessage = '';
  }

  private browserSupportsGeolocation(): boolean {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator;
  }

  private buildAddressFromLocation(form: NgForm, position: GeolocationPosition): RegisterAddress {
    return {
      ...(form.value.Addresses ?? {}),
      Latitude: position.coords.latitude,
      Longitude: position.coords.longitude,
    };
  }

  private submitRegistration(form: NgForm, address: RegisterAddress): void {
    const formData = this.buildRegistrationFormData(form, address);

    this.authService.Register(formData).subscribe({
      next: (response) => this.handleRegisterSuccess(response),
      error: (error) => this.handleRegisterError(error),
    });
  }

  private buildRegistrationFormData(form: NgForm, address: RegisterAddress): FormData {
    const formValue = form.value;
    const formData = new FormData();

    formData.append('FullName', formValue.FullName);
    formData.append('UserName', formValue.UserName);
    formData.append('Email', formValue.Email);
    formData.append('Password', formValue.Password);
    formData.append('ConfirmedPassword', formValue.ConfirmedPassword);
    formData.append('Role', this.selectedRole);
    formData.append('Addresses.Latitude', String(address.Latitude));
    formData.append('Addresses.Longitude', String(address.Longitude));
    formData.append('Addresses.IsDefault', String(address.IsDefault ?? false));
    formData.append('Addresses.Label', String(address.Label ?? 0));

    if (this.imageFile) {
      formData.append('ImageFile', this.imageFile);
    }

    return formData;
  }

  private handleRegisterSuccess(response: any): void {
  this.isSubmitting = false;

  const dialogRef = this.dialog.open(SuccessDialog, {
    width: '450px',
    data: {
      message: 'Your account has been created successfully!',
      username: response?.userName || '',
      email: response?.email || ''
    }
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result?.action === 'login') {
      this.router.navigate(['/login']);
    }
  });
}

  private handleRegisterError(error: any): void {
    this.isSubmitting = false;
    console.error('Registration failed', error);
    
    if (error.error && error.error.message) {
      this.errorMessage = error.error.message;
    } else if (error.message) {
      this.errorMessage = error.message;
    } else {
      this.errorMessage = 'Registration failed. Please try again.';
    }
    
    if (this.errorMessage.includes('non alphanumeric')) {
      this.errorMessage = 'Password must contain at least one special character (e.g., @, $, !, %, *, ?, &)';
    }
    
    console.log('Error message set to:', this.errorMessage);
  }

  private handleLocationError(message: string): void {
    this.locationError = message;
    this.isSubmitting = false;
    this.errorMessage = message;
  }

  private updateSelectedImage(file: File): void {
    this.revokeImagePreview();
    this.imageFile = file;
    this.imagePreviewUrl = URL.createObjectURL(file);
  }

  private revokeImagePreview(): void {
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
      this.imagePreviewUrl = null;
    }
  }

  ngOnDestroy(): void {
    this.revokeImagePreview();
  }
}