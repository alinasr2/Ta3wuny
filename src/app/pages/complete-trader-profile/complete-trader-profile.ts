import { Component, inject, OnInit, signal } from '@angular/core';
import { Auth } from '../../core/services/auth/auth';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-complete-trader-profile',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './complete-trader-profile.html',
  styleUrl: './complete-trader-profile.scss',
})
export class CompleteTraderProfile implements OnInit {
  private authService = inject(Auth);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  businessTypes = [
    { value: 0, label: 'مطعم' },
    { value: 1, label: 'تاجر جملة' },
    { value: 2, label: 'تاجر تجزئة' },
  ];
  
  form = new FormGroup({
    businessName: new FormControl('', [Validators.required]),
    businessType: new FormControl(0, [Validators.required]),
    description: new FormControl(''),
    taxNumber: new FormControl(''),
  });

  ngOnInit() {
    
  }

  submit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    this.authService.completeTraderProfile(this.form.value).subscribe({
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
