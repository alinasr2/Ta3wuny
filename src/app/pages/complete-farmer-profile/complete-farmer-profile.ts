import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../core/services/auth/auth';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-complete-farmer-profile',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './complete-farmer-profile.html',
  styleUrl: './complete-farmer-profile.scss',
})
export class CompleteFarmerProfile {
  private authService = inject(Auth);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = new FormGroup({
    farmName: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.authService.completeFarmerProfile(this.form.value).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.router.navigate(['/']);
        } else {
          this.error.set(res.message);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('حدث خطأ، حاول مرة أخرى');
        this.loading.set(false);
      },
    });
  }
}
