import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteFarmerProfile } from './complete-farmer-profile';

describe('CompleteFarmerProfile', () => {
  let component: CompleteFarmerProfile;
  let fixture: ComponentFixture<CompleteFarmerProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompleteFarmerProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(CompleteFarmerProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
