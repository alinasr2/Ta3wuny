import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Traders } from './traders';

describe('Traders', () => {
  let component: Traders;
  let fixture: ComponentFixture<Traders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Traders],
    }).compileComponents();

    fixture = TestBed.createComponent(Traders);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
