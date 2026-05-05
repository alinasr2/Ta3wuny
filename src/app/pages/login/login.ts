import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../core/services/auth/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule,RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly authService = inject(Auth);
  private readonly router = inject(Router);
  errorMsg:string=''
  loading:boolean = false;
  form: FormGroup = new FormGroup({
    email: new FormControl(null,[Validators.required,Validators.email]),
    password: new FormControl(null,[Validators.required]),
  });

  Login() {
    if (this.form.valid) {
      this.loading = true;
      this.authService.Login(this.form.value).subscribe({
      next:(res)=>{
        this.router.navigate(['/'])
        this.loading = false;
      },
      error:(err)=>{
        this.loading = false;
        this.errorMsg = err.error.message;
        console.log(err);
        
      }
    })
    }
  }
}
