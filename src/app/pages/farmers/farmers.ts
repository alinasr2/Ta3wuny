import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Users } from '../../core/services/users/users';
import { FarmerCard } from "../../shared/components/farmer-card/farmer-card";
import { IFarmer } from '../../shared/interfaces/ifarmer';

@Component({
  selector: 'app-farmers',
  imports: [FarmerCard],
  templateUrl: './farmers.html',
  styleUrl: './farmers.scss',
})
export class Farmers implements OnInit {
  private readonly usersService = inject(Users);
  farmers:IFarmer[] = [];

  ngOnInit(): void {
    this.usersService.getAllFarmers().subscribe({
      next:(res)=>{
        console.log(res)
        this.farmers = res.data;
      },
      error:(err)=>{
        console.log(err);
        
      }
    })
  }
}
