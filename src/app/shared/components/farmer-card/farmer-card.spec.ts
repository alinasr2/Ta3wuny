import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmerCard } from './farmer-card';

describe('FarmerCard', () => {
  let component: FarmerCard;
  let fixture: ComponentFixture<FarmerCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmerCard],
    }).compileComponents();

    fixture = TestBed.createComponent(FarmerCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
