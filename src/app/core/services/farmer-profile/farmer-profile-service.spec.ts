import { TestBed } from '@angular/core/testing';

import { FarmerProfileService } from './farmer-profile-service';

describe('FarmerProfileService', () => {
  let service: FarmerProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FarmerProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
