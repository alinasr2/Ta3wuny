import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraderProfile } from './trader-profile';

describe('TraderProfile', () => {
  let component: TraderProfile;
  let fixture: ComponentFixture<TraderProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraderProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(TraderProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
