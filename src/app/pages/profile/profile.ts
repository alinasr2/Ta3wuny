import {  Component, inject, OnInit, signal} from '@angular/core';
import { Auth } from '../../core/services/auth/auth';
import { TraderProfile } from "../../shared/components/trader-profile/trader-profile";
import { FarmerProfile } from "../../shared/components/farmer-profile/farmer-profile";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { AdminProfile } from "../../shared/components/admin-profile/admin-profile";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [TraderProfile, FarmerProfile, MatProgressSpinner, AdminProfile],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class Profile implements OnInit{
  private readonly authService = inject(Auth);
  role = signal("loading")

  ngOnInit(): void {
    this.authService.setLoggedIn().subscribe({
      next:(res)=>{
        this.role.set(res.value);
      },
      error(err) {
        console.log(err);
        
      },
    })
  }

}