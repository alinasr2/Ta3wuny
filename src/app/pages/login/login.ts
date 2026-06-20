import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Auth } from '../../core/services/auth/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly authService = inject(Auth);
  private readonly router = inject(Router);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  confirmationSent = signal(false);
  sendingConfirmation = signal(false);

  form: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required]),
  });

  Login() {
    if (this.form.valid) {
      this.loading.set(true);
      this.errorMessage.set(null);
      this.confirmationSent.set(false);
      this.authService.Login(this.form.value).subscribe({
        next: (res) => {
          this.loading.set(false);
          if (!res.hasProfile) {
            const role = res.role?.toLowerCase();
            if (role == 'farmer') {
              this.router.navigate(['/complete-farmer-profile']);
            } else if (role == 'trader') {
              this.router.navigate(['/complete-trader-profile']);
            } else {
              this.router.navigate(['/']);
            }
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          this.loading.set(false);
          const msg = err?.error?.message || err?.message || 'حدث خطأ غير متوقع';
          this.errorMessage.set(msg);
        },
      });
    }
  }
  resendConfirmation() {
    const email = this.form.get('email')?.value;
    if (!email) {
      this.errorMessage.set('يرجى إدخال البريد الإلكتروني أولاً');
      return;
    }

    this.sendingConfirmation.set(true);
    this.confirmationSent.set(false);

    this.authService.sendConfirmationLink(email).subscribe({
      next: (response: string) => {
        this.sendingConfirmation.set(false);
        // لو الاستجابة مش فاضية، اعتبرها نجاح
        if (response) {
          this.confirmationSent.set(true);
          this.errorMessage.set(null);
        } else {
          this.errorMessage.set('فشل إرسال رابط التأكيد، حاول لاحقاً');
        }
      },
      error: () => {
        this.sendingConfirmation.set(false);
        this.errorMessage.set('حدث خطأ أثناء إرسال رابط التأكيد');
      },
    });
  }
}
