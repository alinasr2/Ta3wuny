import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-farmer',
  imports: [NgIf,RouterLink],
  templateUrl: './farmer.html',
  styleUrl: './farmer.scss',
})
export class Farmer {
    activeTab: string = 'products';

}
