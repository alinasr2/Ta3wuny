import { Component, Input } from '@angular/core';
import { IFarmer } from '../../interfaces/ifarmer';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-farmer-card',
  imports: [CommonModule,RouterLink],
  templateUrl: './farmer-card.html',
  styleUrl: './farmer-card.scss',
})
export class FarmerCard {
  @Input() farmer:IFarmer = {
    farmerId: '',
    name: '',
    farmName: '',
    description: '',
    email: '',
    userName: '',
    address: {
      id: 0,
      userId: '',
      street: '',
      city: '',
      governorate: '',
      postalCode: undefined,
      country: '',
      latitude: 0,
      longitude: 0
    },
    profileImageUrl: '',
    joinDate: '',
    isVerified: false,
    messsage: undefined
  };
}
