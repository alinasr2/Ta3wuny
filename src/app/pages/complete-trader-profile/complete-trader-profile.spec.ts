import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteTraderProfile } from './complete-trader-profile';

describe('CompleteTraderProfile', () => {
  let component: CompleteTraderProfile;
  let fixture: ComponentFixture<CompleteTraderProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompleteTraderProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(CompleteTraderProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
